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

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');
const socketIO = require('socket.io');

const passport = require('@config/passport');
const bootstrap = require('@utilities/bootstrap');
const globalErrorHandler = require('@controllers/globalErrorHandler');

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer, { cors: { origin: process.env.CORS_ORIGIN } });

bootstrap.standardizedBindingToApp({
    app,
    suffix: '/api/v1/',
    routes: [
        'github',
        'auth',
        'repository',
        'webhook',
        'deployment',
        'server'
    ],
    middlewares: [
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true
        }),
        cors({ origin: process.env.CORS_ORIGIN, credentials: true }),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        passport.initialize(),
        passport.session()
    ],
    settings: {
        deactivated: [
            'x-powered-by'
        ]
    }
});

app.all('*', (req, res) => {
    if(req.path.startsWith('/api/v1/')){
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

module.exports = { app, httpServer, io };