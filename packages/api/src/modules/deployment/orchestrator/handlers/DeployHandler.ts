import Repository from '@/modules/repository/models/Repository';
import Deployment from '../../models/Deployment';
import DockerContainer from '@/modules/docker/models/DockerContainer';
import ProvisionService from '../ProvisionService';
import Release from '../Release';
import ActivityStepContext from '@/modules/activity/services/ActivityStepContext';
import { resolveStrategy, getBuilder } from '../build';
import { emitBuildLog, type BuildContext } from '../build/BuildContext';
import { emitStatusChanged, emitCompleted } from '../statusEvents';
import { failureMessage } from '../failureMessage';
import { BuildStrategy } from '@quantum/contracts/modules/repository/domain';
import { DeploymentStatus } from '@quantum/contracts/modules/deployment/domain';
import type Job from '../../models/Job';
import type { DeploymentArtifact } from '@quantum/contracts/modules/deployment/domain';

export default class DeployHandler{
    #provision = new ProvisionService();

    async run(job: Job): Promise<void>{
        if(!job.repositoryId) throw new Error('Deploy::Repository::Required');
        const repository = await Repository.findOneBy({ id: job.repositoryId });
        if(!repository) throw new Error('Deploy::Repository::NotFound');

        const activity = new ActivityStepContext({
            organizationId: repository.organizationId,
            userId: job.userId ?? repository.userId,
            scope: 'deployment',
            source: 'orchestrator.deploy',
            correlationId: String(job.id)
        });

        const reason = (job.payload.reason as string) ?? 'manual';
        if(reason === 'rollback') return this.#rollback(job, repository, activity);
        await this.#forward(job, repository, activity);
    }

    async #rollback(job: Job, repository: Repository, activity: ActivityStepContext): Promise<void>{
        await activity.progress('Rolling back to previous artifact');

        const rollbackTo = job.payload.rollbackTo as number | null;
        const target = rollbackTo
            ? await Deployment.findOneBy({ id: rollbackTo, repositoryId: repository.id })
            : null;
        const tag = target?.artifact?.tag;
        if(!target || !tag) throw new Error('Deploy::Rollback::NoArtifact');

        const container = await this.#provision.ensureRepositoryInfra(repository);
        const release = new Release(container, repository, (line) => emitBuildLog(target, line));
        await release.takeOver(tag);

        await Deployment.update(
            { repositoryId: repository.id, status: DeploymentStatus.Success },
            { status: DeploymentStatus.Rolledback }
        );
        emitStatusChanged(target.id, repository.id, DeploymentStatus.Rolledback);
        await release.settle();
        emitCompleted(target.id, repository.id, DeploymentStatus.Rolledback);
    }

    async #forward(job: Job, repository: Repository, activity: ActivityStepContext): Promise<void>{
        const deployment = await this.#createDeployment(job, repository);
        emitStatusChanged(deployment.id, repository.id, DeploymentStatus.Building);

        try{
            const container = await activity.step('Provisioning infrastructure', () => this.#provision.ensureRepositoryInfra(repository));
            const artifact = await activity.step('Building application', () => this.#build(job, repository, container, deployment));

            const release = artifact === null
                ? null
                : await activity.step('Switching to the new version', () => this.#takeOver(container, repository, deployment, artifact.tag));

            deployment.status = DeploymentStatus.Success;
            deployment.error = null;
            await deployment.save();
            emitStatusChanged(deployment.id, repository.id, DeploymentStatus.Success);

            if(release !== null) await activity.step('Watching the new version', () => release.settle());
            emitCompleted(deployment.id, repository.id, DeploymentStatus.Success);
        }catch(error){
            deployment.status = DeploymentStatus.Failure;
            deployment.error = failureMessage(error);
            await deployment.save();
            emitStatusChanged(deployment.id, repository.id, DeploymentStatus.Failure);
            emitCompleted(deployment.id, repository.id, DeploymentStatus.Failure);
            throw error;
        }
    }

    async #createDeployment(job: Job, repository: Repository): Promise<Deployment>{
        const previous = await Deployment.findOne({
            where: { repositoryId: repository.id },
            order: { createdAt: 'DESC', id: 'DESC' }
        });

        return Deployment.create({
            repositoryId: repository.id,
            userId: job.userId ?? repository.userId,
            organizationId: repository.organizationId,
            githubDeploymentId: null,
            status: DeploymentStatus.Building,
            error: null,
            commit: null,
            artifact: null,
            url: null,
            environmentVariables: previous?.environmentVariables ?? {}
        }).save();
    }

    async #takeOver(container: DockerContainer, repository: Repository, deployment: Deployment, image: string): Promise<Release>{
        const release = new Release(container, repository, (line) => emitBuildLog(deployment, line));
        await release.takeOver(image);
        return release;
    }

    /* The built artifact, or null for an exec build, which already runs in the container that serves it. */
    async #build(job: Job, repository: Repository, container: DockerContainer, deployment: Deployment): Promise<DeploymentArtifact | null>{
        const strategy = resolveStrategy(repository, []);
        const ctx: BuildContext = {
            repository,
            deployment,
            container,
            nodeId: job.nodeId,
            storagePath: container.storagePath
        };
        const artifact = await getBuilder(strategy).build(ctx);
        deployment.artifact = artifact;
        await deployment.save();

        return strategy === BuildStrategy.Exec ? null : artifact;
    }
}
