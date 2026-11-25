import { eventBus } from '@/shared/events/EventBus';
import { saveOrConflict } from '@/shared/models/isUniqueViolation';
import { assertProject } from '@/shared/tenancy';
import ValidationError from '@/shared/errors/ValidationError';
import { TenancyError } from '@/modules/organization/contracts/domain/errors';
import Project from '@/modules/project/models/Project';
import Repository from '../models/Repository';
import { oneWithContainerStatus, withContainerStatus } from './withContainerStatus';
import { normalizeVolumes } from './repositoryVolumes';
import { normalizeHealthCheckPath } from './healthCheckPath';
import { RepositoryError } from '../contracts/domain/errors';
import { SourceType } from '@quantum/contracts/modules/repository/domain';
import type { Tenant } from '@/modules/organization/contracts/types/fastify';
import type { RollbackAccepted } from '@quantum/contracts/modules/repository/domain';
import type { Repository as RepositoryPayload } from '@quantum/contracts/modules/repository/domain';
import type { CreateRepositoryInput, UpdateRepositoryInput } from '@quantum/contracts/modules/repository/http';

const ALIAS_MIN_LENGTH = 4;
const ALIAS_MAX_LENGTH = 32;

const REDEPLOY_FIELDS: Array<keyof UpdateRepositoryInput> = [
    'buildCommand', 'installCommand', 'startCommand', 'rootDirectory',
    'branch', 'framework', 'runtime', 'runtimeVersion', 'outputDirectory',
    'buildStrategy', 'dockerfilePath', 'image', 'volumes'
];

export default class RepositoryService{
    async listMine(userId: number): Promise<RepositoryPayload[]>{
        const repositories = await Repository.find({ where: { userId }, order: { id: 'ASC' } });
        return withContainerStatus(repositories);
    }

    async create(userId: number, tenant: Tenant, input: CreateRepositoryInput): Promise<RepositoryPayload>{
        if(tenant.organizationId === null) throw TenancyError.OrganizationNotFound();
        const project = await this.#projectFor(tenant, input.projectId);

        const repository = await saveOrConflict(Repository.create({
            name: input.name,
            alias: this.#alias(input.alias ?? input.name),
            owner: input.owner ?? null,
            branch: input.branch ?? 'main',
            webhookId: null,
            buildCommand: input.buildCommand ?? '',
            installCommand: input.installCommand ?? '',
            startCommand: input.startCommand ?? '',
            rootDirectory: input.rootDirectory ?? '/',
            framework: input.framework ?? null,
            runtime: input.runtime ?? null,
            runtimeVersion: input.runtimeVersion ?? null,
            outputDirectory: input.outputDirectory ?? null,
            url: input.url,
            port: input.port ?? null,
            volumes: normalizeVolumes(input.volumes ?? []),
            userId,
            organizationId: tenant.organizationId,
            projectId: project.id,
            sourceType: SourceType.Github
        }).save(), RepositoryError.AliasAlreadyTaken);

        eventBus.emit('deployment.requested', {
            repositoryId: repository.id,
            reason: 'create',
            commit: null,
            userId
        });

        return oneWithContainerStatus(repository);
    }

    async getOwned(userId: number, tenant: Tenant, id: number): Promise<Repository>{
        const repository = await Repository.findOneBy({ id });
        if(!repository) throw RepositoryError.NotFound();
        if(tenant.isPlatformAdmin || repository.userId === userId) return repository;
        if(tenant.projectIds.includes(repository.projectId)) return repository;
        throw RepositoryError.Forbidden();
    }

    async update(userId: number, tenant: Tenant, repository: Repository, input: UpdateRepositoryInput): Promise<RepositoryPayload>{
        await this.#apply(tenant, repository, input);
        const updated = await saveOrConflict(repository.save(), RepositoryError.AliasAlreadyTaken);
        this.#requestRedeploy(updated, input, userId);
        return oneWithContainerStatus(updated);
    }

    async remove(repository: Repository): Promise<void>{
        const { id } = repository;
        await repository.remove();
        eventBus.emit('repository.deleted', { repositoryId: id });
    }

    rollback(userId: number, repository: Repository, deploymentId: number): RollbackAccepted{
        eventBus.emit('deployment.rollbackRequested', {
            repositoryId: repository.id,
            deploymentId,
            userId
        });
        return { repositoryId: repository.id, deploymentId };
    }

    async #apply(tenant: Tenant, repository: Repository, input: UpdateRepositoryInput): Promise<void>{
        if(input.name !== undefined) repository.name = input.name;
        if(input.url !== undefined) repository.url = input.url;
        if(input.owner !== undefined) repository.owner = input.owner;
        if(input.alias !== undefined) repository.alias = input.alias;
        if(input.branch !== undefined) repository.branch = input.branch;
        if(input.buildCommand !== undefined) repository.buildCommand = input.buildCommand;
        if(input.installCommand !== undefined) repository.installCommand = input.installCommand;
        if(input.startCommand !== undefined) repository.startCommand = input.startCommand;
        if(input.rootDirectory !== undefined) repository.rootDirectory = input.rootDirectory;
        if(input.framework !== undefined) repository.framework = input.framework;
        if(input.runtime !== undefined) repository.runtime = input.runtime;
        if(input.runtimeVersion !== undefined) repository.runtimeVersion = input.runtimeVersion;
        if(input.outputDirectory !== undefined) repository.outputDirectory = input.outputDirectory;
        if(input.port !== undefined) repository.port = input.port;
        if(input.healthCheckPath !== undefined) repository.healthCheckPath = normalizeHealthCheckPath(input.healthCheckPath);
        if(input.buildStrategy !== undefined) repository.buildStrategy = input.buildStrategy;
        if(input.dockerfilePath !== undefined) repository.dockerfilePath = input.dockerfilePath === '' ? null : input.dockerfilePath;
        if(input.image !== undefined) repository.image = input.image === '' ? null : input.image;
        if(input.volumes !== undefined) repository.volumes = normalizeVolumes(input.volumes);
        if(input.projectId !== undefined){
            repository.projectId = (await this.#projectFor(tenant, input.projectId)).id;
        }
    }

    #requestRedeploy(repository: Repository, input: UpdateRepositoryInput, userId: number){
        if(!REDEPLOY_FIELDS.some((field) => input[field] !== undefined)) return;
        eventBus.emit('deployment.requested', {
            repositoryId: repository.id,
            reason: 'manual',
            commit: null,
            userId
        });
    }

    #alias(raw: string): string{
        if(raw.length < ALIAS_MIN_LENGTH){
            throw new ValidationError({ alias: `At least ${ALIAS_MIN_LENGTH} characters` });
        }
        if(raw.length > ALIAS_MAX_LENGTH){
            throw new ValidationError({ alias: `At most ${ALIAS_MAX_LENGTH} characters` });
        }
        return raw;
    }

    async #projectFor(tenant: Tenant, projectId: number): Promise<Project>{
        const project = await Project.findOneBy({ id: projectId });
        if(!project) throw TenancyError.ProjectNotFound();
        assertProject(tenant, project.id, TenancyError.ProjectForbidden);
        return project;
    }
}
