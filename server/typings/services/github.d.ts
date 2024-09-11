export type DeploymentState = 'error' | 'failure' | 'inactive' | 'in_progress' | 'queued' | 'pending' | 'success';

// @middlewares/github.ts
declare module 'express-session'{
    interface SessionData{
        userId?: string;
    }
}