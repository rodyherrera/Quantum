export interface ActiveDeploymentEnvironment{
    _id: ObjectId;
    environment: Record<string, any>;
}

export interface ActiveDeploymentRepositoryDocument{
    deployments: ActiveDeploymentEnvironment[]
}