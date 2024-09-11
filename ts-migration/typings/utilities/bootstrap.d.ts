import { Application, RequestHandler } from 'express';

export interface ConfigureAppParams{
    app: Application;
    routes: string[];
    suffix: string;
    middlewares: RequestHandler[];
    settings: {};
};