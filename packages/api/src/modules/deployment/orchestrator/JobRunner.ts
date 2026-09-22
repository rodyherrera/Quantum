import { LessThanOrEqual } from 'typeorm';
import Job from '../models/Job';
import { JobStatus, JobType } from '@quantum/contracts/modules/deployment/domain';
import { logger } from '@/shared/utils/Logger';

export type JobHandler = (job: Job) => Promise<void>;
export type JobHandlerMap = Partial<Record<JobType, JobHandler>>;

export interface JobRunnerOptions{
    nodeId?: string;
    workerId?: string;
    leaseMs?: number;
    pollIntervalMs?: number;
}

const MAX_PROCESSED_PER_PASS = 10000;

export default class JobRunner{
    readonly nodeId: string;
    readonly workerId: string;
    readonly leaseMs: number;
    readonly pollIntervalMs: number;

    #running = false;
    #timer: NodeJS.Timeout | null = null;

    constructor(private handlers: JobHandlerMap, options: JobRunnerOptions = {}){
        this.nodeId = options.nodeId ?? process.env.NODE_ID ?? 'local';
        this.workerId = options.workerId ?? `${this.nodeId}:worker`;
        this.leaseMs = options.leaseMs ?? (Number(process.env.JOB_LEASE_MS) || 120000);
        this.pollIntervalMs = options.pollIntervalMs ?? 1000;
    }

    start(): void{
        if(this.#running) return;
        this.#running = true;
        logger.info(`job runner ${this.workerId} started (node=${this.nodeId})`, { scope: 'orchestrator.runner' });
        this.#schedule();
    }

    stop(): void{
        this.#running = false;
        if(this.#timer) clearTimeout(this.#timer);
        this.#timer = null;
    }

    async processDue(): Promise<number>{
        await this.sweep();
        let processed = 0;
        while(processed < MAX_PROCESSED_PER_PASS){
            const job = await this.claim();
            if(!job) break;
            await this.#process(job);
            processed++;
        }
        return processed;
    }

    async sweep(): Promise<number>{
        const result = await Job.update(
            { status: JobStatus.Delayed, runAt: LessThanOrEqual(new Date()) },
            { status: JobStatus.Queued }
        );
        return result.affected ?? 0;
    }

    async claim(): Promise<Job | null>{
        const now = new Date();
        const job = await Job.createQueryBuilder('job')
            .where('job.nodeId = :nodeId', { nodeId: this.nodeId })
            .andWhere('job.runAt <= :now', { now })
            .andWhere('(job.status = :queued OR (job.status = :active AND job.lockedUntil <= :now))', {
                queued: JobStatus.Queued,
                active: JobStatus.Active
            })
            .andWhere(`(
                job.lockKey IS NULL
                OR job.lockKey NOT IN (
                    SELECT held."lockKey"
                    FROM ${Job.getRepository().metadata.tablePath} held
                    WHERE held."nodeId" = :nodeId
                      AND held.status = :active
                      AND held."lockedUntil" > :now
                      AND held."lockKey" IS NOT NULL
                )
            )`)
            .orderBy('job.priority', 'DESC')
            .addOrderBy('job.runAt', 'ASC')
            .addOrderBy('job.id', 'ASC')
            .getOne();

        if(job === null) return null;
        return this.#markActive(job, now);
    }

    async #markActive(job: Job, now: Date): Promise<Job>{
        job.status = JobStatus.Active;
        job.claimedBy = this.workerId;
        job.lockedUntil = new Date(now.getTime() + this.leaseMs);
        job.attempts += 1;
        await job.save();
        return job;
    }

    async #process(job: Job): Promise<void>{
        const handler = this.handlers[job.type];
        try{
            if(!handler) throw new Error(`Orchestrator::Dispatch::UnknownJobType::${job.type}`);
            await handler(job);
            await this.#complete(job);
        }catch(error){
            const message = error instanceof Error ? error.message : String(error);
            await this.#fail(job, message);
            logger.error(`job ${job.id} (${job.type}) failed: ${message}`, error, { scope: 'orchestrator.runner' });
        }
    }

    async #complete(job: Job): Promise<void>{
        await Job.update(
            { id: job.id, claimedBy: this.workerId },
            { status: JobStatus.Completed, lockedUntil: null, result: {} }
        );
    }

    async #fail(job: Job, error: string): Promise<void>{
        if(job.attempts < job.maxAttempts){
            const delay = job.backoffMs * Math.pow(2, Math.max(0, job.attempts - 1));
            await Job.update(
                { id: job.id, claimedBy: this.workerId },
                { status: JobStatus.Delayed, error, runAt: new Date(Date.now() + delay), lockedUntil: null, claimedBy: null }
            );
            return;
        }
        await Job.update(
            { id: job.id, claimedBy: this.workerId },
            { status: JobStatus.Failed, error, lockedUntil: null, claimedBy: null }
        );
    }

    #schedule(): void{
        if(!this.#running) return;
        this.#timer = setTimeout(() => void this.#tick(), this.pollIntervalMs);
    }

    async #tick(): Promise<void>{
        if(!this.#running) return;
        try{
            await this.processDue();
        }catch(error){
            logger.error('job runner tick failed', error, { scope: 'orchestrator.runner' });
        }finally{
            this.#schedule();
        }
    }
}
