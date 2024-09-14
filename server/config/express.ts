/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import session from 'express-session';
import { Server } from 'socket.io';

import passport from '@config/passport';
import * as bootstrap from '@utilities/bootstrap';
import globalErrorHandler from '@controllers/globalErrorHandler';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN } });

bootstrap.ensurePublicFolderExistence();

bootstrap.configureApp({
    app,
    suffix: '/api/v1/',
    routes: [
        'github',
        'auth',
        'repository',
        'webhook',
        'deployment',
        'server',
        'dockerContainer'
    ],
    middlewares: [
        session({
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: true
        }),
        cors({ origin: process.env.CORS_ORIGIN }),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        passport.initialize(),
        passport.session(),
        express.static('public')
    ],
    settings: {
        deactivated: [
            'x-powered-by'
        ]
    }
});

app.all('*', (req: Request, res: Response) => {
    if(req.path.startsWith('/api/v1/') || !process.env.CLIENT_HOST){
        return res.status(404).json({
            status: 'error',
            data: {
                message: 'INVALID_API_REQUEST',
                url: req.originalUrl
            }
        })
    }
    res.redirect(process.env.CLIENT_HOST);
});

app.use(globalErrorHandler);

export { app,httpServer, io };
