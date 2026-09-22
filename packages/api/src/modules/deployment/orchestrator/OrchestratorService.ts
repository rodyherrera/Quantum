import { In, Not, type DeepPartial } from 'typeorm';
import Job from '../models/Job';
import { JobStatus, JobType } from '@quantum/contracts/modules/deployment/domain';
import { isUniqueViolation } from '@/shared/models/isUniqueViolation';

export interface EnqueueInput{
    type: JobType;
    repositoryId?: number;
    userId?: number;
    containerId?: number;
    deploymentId?: number;
    projectId?: number;
    organizationId?: number;
    templateInstallId?: number;
    payload?: Record<string, unknown>;
    nodeId?: string;
    idempotencyKey?: string;
    lockKey?: string;
    priority?: number;
    maxAttempts?: number;
    delayMs?: number;
}

export interface DeployOptions{
    reason?: 'initial' | 'push' | 'manual' | 'reconcile' | 'rollback';
    commit?: string;
    userId?: number;
    rollbackTo?: number;
}

const IN_FLIGHT: JobStatus[] = [JobStatus.Queued, JobStatus.Delayed, JobStatus.Active];

export default class OrchestratorService{
    readonly nodeId = process.env.NODE_ID ?? 'local';

    async enqueue(input: EnqueueInput): Promise<Job>{
        const doc = this.#buildDoc(input);
        if(!input.idempotencyKey) return Job.create(doc).save();
        return this.#enqueueIdempotent(input.idempotencyKey, doc);
    }

    deploy(repositoryId: number, options: DeployOptions = {}): Promise<Job>{
        const reason = options.reason ?? 'manual';
        const idempotencyKey = options.commit ? `deploy:${repositoryId}:${options.commit}` : undefined;
        return this.enqueue({
            type: JobType.Deploy,
            repositoryId,
            userId: options.userId,
            payload: { reason, commit: options.commit ?? null, rollbackTo: options.rollbackTo ?? null },
            lockKey: `repo:${repositoryId}`,
            idempotencyKey
        });
    }

    lifecycle(repositoryId: number, action: 'start' | 'stop' | 'restart', userId?: number): Promise<Job>{
        const type = action === 'start' ? JobType.Start : action === 'stop' ? JobType.Stop : JobType.Restart;
        return this.enqueue({
            type,
            repositoryId,
            userId,
            payload: { action },
            lockKey: `repo:${repositoryId}`
        });
    }

    reload(containerId: number, options: { userId?: number } = {}): Promise<Job>{
        return this.enqueue({
            type: JobType.Reload,
            containerId,
            userId: options.userId,
            lockKey: `container:${containerId}`
        });
    }

    databaseJob(
        type: JobType.DbProvision | JobType.DbBackup | JobType.DbRestore | JobType.DbDelete,
        databaseId: number,
        options: { userId?: number; projectId?: number; backupId?: string; containerId?: number | null } = {}
    ): Promise<Job>{
        return this.enqueue({
            type,
            userId: options.userId,
            projectId: options.projectId,
            payload: {
                databaseId,
                ...(options.backupId ? { backupId: options.backupId } : {}),
                ...(options.containerId !== undefined && options.containerId !== null ? { containerId: options.containerId } : {})
            },
            lockKey: `database:${databaseId}`
        });
    }

    reconcile(nodeId: string = this.nodeId): Promise<Job>{
        return this.enqueue({
            type: JobType.Reconcile,
            nodeId,
            lockKey: `reconcile:${nodeId}`,
            idempotencyKey: `reconcile:${nodeId}`,
            maxAttempts: 1
        });
    }

    orgCascadeDelete(organizationId: number, options: { userId?: number } = {}): Promise<Job>{
        return this.enqueue({
            type: JobType.OrgCascadeDelete,
            organizationId,
            userId: options.userId,
            lockKey: `org:${organizationId}`,
            idempotencyKey: `org-cascade:${organizationId}`,
            maxAttempts: 3
        });
    }

    projectCascadeDelete(projectId: number, options: { userId?: number } = {}): Promise<Job>{
        return this.enqueue({
            type: JobType.ProjectCascadeDelete,
            projectId,
            userId: options.userId,
            lockKey: `project:${projectId}`,
            idempotencyKey: `project-cascade:${projectId}`,
            maxAttempts: 3
        });
    }

    metricsSample(nodeId: string = this.nodeId): Promise<Job>{
        return this.enqueue({
            type: JobType.MetricsSample,
            nodeId,
            lockKey: `metrics:${nodeId}`,
            idempotencyKey: `metrics:${nodeId}`,
            maxAttempts: 1
        });
    }

    repositoryTeardown(repositoryId: number): Promise<Job>{
        return this.enqueue({
            type: JobType.RepositoryTeardown,
            repositoryId,
            lockKey: `repo:${repositoryId}`,
            idempotencyKey: `repo-teardown:${repositoryId}`
        });
    }

    codespaceJob(
        type: JobType.CodespaceProvision | JobType.CodespaceDelete,
        codespaceId: number,
        options: { userId?: number; payload?: Record<string, unknown> } = {}
    ): Promise<Job>{
        return this.enqueue({
            type,
            userId: options.userId,
            payload: { codespaceId, ...options.payload },
            lockKey: `codespace:${codespaceId}`
        });
    }

    templateJob(
        type: JobType.TemplateInstall | JobType.TemplateUninstall,
        templateInstallId: number,
        options: { userId?: number; projectId?: number; payload?: Record<string, unknown> } = {}
    ): Promise<Job>{
        return this.enqueue({
            type,
            templateInstallId,
            userId: options.userId,
            projectId: options.projectId,
            payload: options.payload,
            lockKey: `template:${templateInstallId}`,
            priority: 10
        });
    }

    #buildDoc(input: EnqueueInput): DeepPartial<Job>{
        const doc: DeepPartial<Job> = {
            type: input.type,
            status: JobStatus.Queued,
            nodeId: input.nodeId ?? this.nodeId,
            repositoryId: input.repositoryId ?? null,
            userId: input.userId ?? null,
            containerId: input.containerId ?? null,
            deploymentId: input.deploymentId ?? null,
            projectId: input.projectId ?? null,
            organizationId: input.organizationId ?? null,
            templateInstallId: input.templateInstallId ?? null,
            payload: input.payload ?? {},
            priority: input.priority ?? 0,
            runAt: new Date(Date.now() + (input.delayMs ?? 0)),
            idempotencyKey: input.idempotencyKey ?? null,
            lockKey: input.lockKey ?? null
        };
        if(input.maxAttempts !== undefined) doc.maxAttempts = input.maxAttempts;
        return doc;
    }

    async #enqueueIdempotent(key: string, doc: DeepPartial<Job>): Promise<Job>{
        const existing = await Job.findOneBy({ idempotencyKey: key, status: In(IN_FLIGHT) });
        if(existing) return existing;

        await Job.update({ idempotencyKey: key, status: Not(In(IN_FLIGHT)) }, { idempotencyKey: null });
        try{
            return await Job.create(doc).save();
        }catch(error){
            if(isUniqueViolation(error)){
                const found = await Job.findOneBy({ idempotencyKey: key, status: In(IN_FLIGHT) });
                if(found) return found;
            }
            throw error;
        }
    }
}
