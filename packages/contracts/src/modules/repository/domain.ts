import type { ContainerAddress, ContainerStatus, PortBindingProtocol } from '../docker/domain';
import type { BaseEntity } from '../../shared/base';

export enum BuildStrategy{
    Auto = 'auto',
    Dockerfile = 'dockerfile',
    PrebuiltImage = 'prebuilt-image',
    Exec = 'exec'
}

export enum SourceType{
    Github = 'github'
}

export enum RepositoryOperation{
    Start = 'start',
    Stop = 'stop',
    Restart = 'restart'
}

export interface RepositoryPort{
    internalPort: number;
    externalPort: number;
    protocol: PortBindingProtocol;
}

export interface Repository extends BaseEntity{
    name: string;
    alias: string;
    owner: string | null;
    branch: string;
    webhookId: string | null;
    buildCommand: string;
    installCommand: string;
    startCommand: string;
    rootDirectory: string;
    framework: string | null;
    runtime: string | null;
    runtimeVersion: string | null;
    outputDirectory: string | null;
    buildStrategy: BuildStrategy;
    dockerfilePath: string | null;
    image: string | null;
    url: string;
    port: number | null;
    healthCheckPath: string | null;
    containerStatus: ContainerStatus | null;
    ports: RepositoryPort[];
    address: ContainerAddress | null;
    volumes: string[];
    userId: number;
    organizationId: number | null;
    projectId: number;
    sourceType: SourceType;
}

export interface RollbackAccepted{
    repositoryId: number;
    deploymentId: number;
}

export type WebhookOutcome =
    | { ok: true }
    | { skipped: true; reason: 'branch-mismatch' | 'not-published' }
    | { skipped: false };
