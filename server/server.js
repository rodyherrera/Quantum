require('dotenv').config({ path: './.env' });
global.ptyStore = {};
global.ptyLog = {};

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');
const socketIO = require('socket.io');
const moduleAlias = require('module-alias');

moduleAlias.addAliases({
    '@utilities': `${__dirname}/utilities/`,
    '@routes': `${__dirname}/routes/`,
    '@models': `${__dirname}/models/`,
    '@middlewares': `${__dirname}/middlewares/`,
    '@controllers': `${__dirname}/controllers/`
});

const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;

const { connectToMongoDb } = require('@utilities/runtime');
const bootstrap = require('@utilities/bootstrap');
const globalErrorHandler = require('@controllers/globalErrorHandler');
const webSocketController = require('@controllers/wsController');

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer, { cors: { origin: process.env.CORS_ORIGIN } });
const serverPort = process.env.SERVER_PORT || 8000;
const serverHostname = process.env.SERVER_HOSTNAME || '0.0.0.0';

passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `http://${process.env.SERVER_HOSTNAME}:${process.env.SERVER_PORT}/api/v1/github/callback/`,
    scope: ['user', 'repo']
}, (accessToken, refreshToken, profile, cb) => {
    return cb(null, { accessToken, profile, refreshToken  });
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

bootstrap.standardizedBindingToApp({
    app,
    suffix: '/api/v1/',
    routes: [
        'github',
        'auth',
        'repository',
        'deployment'
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

app.all('*', (Request, Response) => {
    if(Request.path.startsWith('/api/v1/')){
        return Response.status(404).json({
            Status: 'Error',
            Data: {
                Message: 'INVALID_API_REQUEST',
                URL: Request.originalUrl
            }
        })
    }
    Response.redirect(process.env.CLIENT_HOST);
});

app.use(globalErrorHandler);

webSocketController(io);

httpServer.listen(serverPort, serverHostname, async () => {
    await connectToMongoDb();
    await bootstrap.loadRepositoriesPTYs();
    console.log(`[Quantum Cloud]: Server running at http://${serverHostname}:${serverPort}/`);
});