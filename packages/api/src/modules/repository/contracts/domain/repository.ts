import type { BuildStrategy, SourceType } from '@quantum/contracts/modules/repository/domain';

export interface RepositoryFields{
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
    userId: number;
    organizationId: number | null;
    projectId: number;
    sourceType: SourceType;
    volumes: string[];
    createdAt: Date;
    updatedAt: Date;
}
