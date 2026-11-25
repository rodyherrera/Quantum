import type { BuildStrategy, RepositoryOperation } from './domain';

export interface CreateRepositoryInput{
    name: string;
    url: string;
    owner?: string;
    alias?: string;
    branch?: string;
    buildCommand?: string;
    installCommand?: string;
    startCommand?: string;
    rootDirectory?: string;
    framework?: string;
    runtime?: string;
    runtimeVersion?: string;
    outputDirectory?: string;
    port?: number;
    volumes?: string[];
    projectId: number;
}

export interface UpdateRepositoryInput{
    name?: string;
    url?: string;
    owner?: string;
    alias?: string;
    branch?: string;
    buildCommand?: string;
    installCommand?: string;
    startCommand?: string;
    rootDirectory?: string;
    framework?: string;
    runtime?: string;
    runtimeVersion?: string;
    outputDirectory?: string;
    port?: number;
    healthCheckPath?: string;
    projectId?: number;
    buildStrategy?: BuildStrategy;
    dockerfilePath?: string;
    image?: string;
    volumes?: string[];
}

export interface RepositoryOperationInput{
    operation: RepositoryOperation;
}

export interface StorageWriteInput{
    path: string;
    content: string;
}
