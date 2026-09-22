import { describe, expect, it } from 'vitest';
import { useApp, flushEvents } from '@tests/harness';
import { eventBus } from '@/shared/events/EventBus';
import OrchestratorService from '../orchestrator/OrchestratorService';
import JobRunner from '../orchestrator/JobRunner';
import Job from '../models/Job';
import { JobStatus, JobType } from '@quantum/contracts/modules/deployment/domain';

useApp();

const findByPk = (id: number) => Job.findOneBy({ id });

const requireJob = async (id: number): Promise<Job> => {
    const job = await findByPk(id);
    if(!job) throw new Error(`expected job ${id} to exist`);
    return job;
};

describe('OrchestratorService enqueue', () => {
    it('creates a queued job with a lock key', async () => {
        const job = await new OrchestratorService().deploy(11, { reason: 'manual' });

        expect(job.status).toBe(JobStatus.Queued);
        expect(job.type).toBe(JobType.Deploy);
        expect(job.repositoryId).toBe(11);
        expect(job.lockKey).toBe('repo:11');
        expect(job.attempts).toBe(0);
    });

    it('is idempotent for the same commit', async () => {
        const orchestrator = new OrchestratorService();
        const first = await orchestrator.deploy(12, { reason: 'push', commit: 'abc123' });
        const second = await orchestrator.deploy(12, { reason: 'push', commit: 'abc123' });

        expect(first.id).toBe(second.id);
        expect(first.idempotencyKey).toBe('deploy:12:abc123');
        expect(await Job.countBy({ repositoryId: 12 })).toBe(1);
    });

    it('creates separate jobs for different commits', async () => {
        const orchestrator = new OrchestratorService();
        const first = await orchestrator.deploy(13, { reason: 'push', commit: 'aaa' });
        const second = await orchestrator.deploy(13, { reason: 'push', commit: 'bbb' });

        expect(first.id).not.toBe(second.id);
        expect(await Job.countBy({ repositoryId: 13 })).toBe(2);
    });

    it('allows a new job after a previous one completed', async () => {
        const orchestrator = new OrchestratorService();
        const first = await orchestrator.deploy(14, { reason: 'push', commit: 'sha' });
        first.status = JobStatus.Completed;
        await first.save();

        const second = await orchestrator.deploy(14, { reason: 'push', commit: 'sha' });

        expect(second.id).not.toBe(first.id);
        expect(await Job.countBy({ repositoryId: 14, status: JobStatus.Queued })).toBe(1);
    });

    it('does not pile another metrics sample while one is already in flight', async () => {
        const orchestrator = new OrchestratorService();
        const first = await orchestrator.metricsSample();
        const second = await orchestrator.metricsSample();

        expect(second.id).toBe(first.id);
        expect(await Job.countBy({ type: JobType.MetricsSample })).toBe(1);
    });

    it('enqueues lifecycle jobs keyed by repository', async () => {
        const job = await new OrchestratorService().lifecycle(15, 'restart', 99);

        expect(job.type).toBe(JobType.Restart);
        expect(job.lockKey).toBe('repo:15');
        expect(job.userId).toBe(99);
        expect(job.payload).toMatchObject({ action: 'restart' });
    });
});

describe('JobRunner', () => {
    it('processes a due job to completion with a stubbed handler', async () => {
        const orchestrator = new OrchestratorService();
        const job = await orchestrator.deploy(21, { reason: 'manual' });
        const handled: number[] = [];

        const runner = new JobRunner({ [JobType.Deploy]: async (current) => { handled.push(current.id); } });
        const processed = await runner.processDue();

        expect(processed).toBe(1);
        expect(handled).toEqual([job.id]);
        const fresh = await findByPk(job.id);
        expect(fresh?.status).toBe(JobStatus.Completed);
        expect(fresh?.attempts).toBe(1);
        expect(fresh?.lockedUntil).toBeNull();
    });

    it('delays a failing job with backoff and eventually fails it', async () => {
        const orchestrator = new OrchestratorService();
        const job = await orchestrator.enqueue({ type: JobType.Build, repositoryId: 22, maxAttempts: 2, lockKey: 'repo:22' });

        const runner = new JobRunner({ [JobType.Build]: async () => { throw new Error('build exploded'); } });

        await runner.processDue();
        const delayed = await requireJob(job.id);
        expect(delayed.status).toBe(JobStatus.Delayed);
        expect(delayed.attempts).toBe(1);
        expect(delayed.error).toBe('build exploded');
        expect(delayed.runAt?.getTime()).toBeGreaterThan(Date.now() - 50);

        delayed.runAt = new Date(Date.now() - 1000);
        await delayed.save();

        await runner.processDue();
        const failed = await requireJob(job.id);
        expect(failed.status).toBe(JobStatus.Failed);
        expect(failed.attempts).toBe(2);
    });

    it('serializes jobs that share a lock key', async () => {
        const orchestrator = new OrchestratorService();
        const first = await orchestrator.lifecycle(23, 'start');
        const second = await orchestrator.lifecycle(23, 'stop');
        const order: number[] = [];

        const runner = new JobRunner({
            [JobType.Start]: async (current) => { order.push(current.id); },
            [JobType.Stop]: async (current) => { order.push(current.id); }
        });
        const processed = await runner.processDue();

        expect(processed).toBe(2);
        expect(order).toEqual([first.id, second.id]);
        expect((await findByPk(first.id))?.status).toBe(JobStatus.Completed);
        expect((await findByPk(second.id))?.status).toBe(JobStatus.Completed);
    });

    it('does not run jobs scheduled for the future', async () => {
        const orchestrator = new OrchestratorService();
        const job = await orchestrator.enqueue({ type: JobType.Reload, containerId: 5, delayMs: 60000, lockKey: 'container:5' });

        const runner = new JobRunner({ [JobType.Reload]: async () => undefined });
        const processed = await runner.processDue();

        expect(processed).toBe(0);
        expect((await findByPk(job.id))?.status).toBe(JobStatus.Queued);
    });

    it('marks a job failed when no handler is registered', async () => {
        const orchestrator = new OrchestratorService();
        const job = await orchestrator.enqueue({ type: JobType.MetricsSample, maxAttempts: 1, lockKey: 'metrics:local' });

        const runner = new JobRunner({});
        await runner.processDue();

        const fresh = await findByPk(job.id);
        expect(fresh?.status).toBe(JobStatus.Failed);
        expect(fresh?.error).toContain('UnknownJobType');
    });

    it('claims a later install while older metrics hold the same lock in a long queue', async () => {
        const orchestrator = new OrchestratorService();
        const held = await orchestrator.metricsSample();
        held.status = JobStatus.Active;
        held.lockedUntil = new Date(Date.now() + 120_000);
        held.claimedBy = 'local:worker';
        await held.save();

        for(let i = 0; i < 60; i++){
            await orchestrator.enqueue({ type: JobType.MetricsSample, lockKey: 'metrics:local' });
        }
        const install = await orchestrator.templateJob(JobType.TemplateInstall, 3);

        const handled: JobType[] = [];
        const runner = new JobRunner({
            [JobType.MetricsSample]: async () => { handled.push(JobType.MetricsSample); },
            [JobType.TemplateInstall]: async () => { handled.push(JobType.TemplateInstall); }
        });

        expect(await runner.claim()).toMatchObject({ id: install.id, type: JobType.TemplateInstall });
        expect(handled).toEqual([]);
    });
});

describe('event translation', () => {
    it('creates a deploy job from deployment.requested', async () => {
        eventBus.emit('deployment.requested', { repositoryId: 31, reason: 'push', commit: 'abc', userId: 7 });
        await flushEvents();

        const jobs = await Job.find({ where: { repositoryId: 31 } });
        expect(jobs).toHaveLength(1);
        expect(jobs[0].type).toBe(JobType.Deploy);
        expect(jobs[0].idempotencyKey).toBe('deploy:31:abc');
        expect(jobs[0].payload).toMatchObject({ reason: 'push', commit: 'abc' });
    });

    it('deduplicates a repeated deployment.requested for the same commit', async () => {
        eventBus.emit('deployment.requested', { repositoryId: 32, reason: 'push', commit: 'dup', userId: 7 });
        eventBus.emit('deployment.requested', { repositoryId: 32, reason: 'push', commit: 'dup', userId: 7 });
        await flushEvents();

        expect(await Job.countBy({ repositoryId: 32 })).toBe(1);
    });

    it('creates a rollback deploy job from deployment.rollbackRequested', async () => {
        eventBus.emit('deployment.rollbackRequested', { repositoryId: 33, deploymentId: 42, userId: 7 });
        await flushEvents();

        const jobs = await Job.find({ where: { repositoryId: 33 } });
        expect(jobs).toHaveLength(1);
        expect(jobs[0].type).toBe(JobType.Deploy);
        expect(jobs[0].payload).toMatchObject({ reason: 'rollback', rollbackTo: 42 });
    });

    it('creates a template install job from template.installed', async () => {
        eventBus.emit('template.installed', { templateInstallId: 55, projectId: 3, templateId: 9, userId: 7 });
        await flushEvents();

        const jobs = await Job.find({ where: { templateInstallId: 55 } });
        expect(jobs).toHaveLength(1);
        expect(jobs[0].type).toBe(JobType.TemplateInstall);
    });

    it('creates an org cascade job from organization.deleted', async () => {
        eventBus.emit('organization.deleted', { organizationId: 88 });
        await flushEvents();

        const jobs = await Job.find({ where: { organizationId: 88 } });
        expect(jobs).toHaveLength(1);
        expect(jobs[0].type).toBe(JobType.OrgCascadeDelete);
        expect(jobs[0].idempotencyKey).toBe('org-cascade:88');
    });

    it('creates a project cascade job from project.deleted', async () => {
        eventBus.emit('project.deleted', { projectId: 99, organizationId: 4 });
        await flushEvents();

        const jobs = await Job.find({ where: { projectId: 99 } });
        expect(jobs).toHaveLength(1);
        expect(jobs[0].type).toBe(JobType.ProjectCascadeDelete);
    });
});
