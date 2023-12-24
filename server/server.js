require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
const session = require('express-session');

const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const { connectToMongoDb } = require('./utilities/runtime');
const bootHelper = require('./utilities/bootHelper');

const app = express();
const httpServer = http.createServer(app);
const serverPort = process.env.SERVER_PORT || 8000;
const serverHostname = process.env.SERVER_HOSTNAME || '0.0.0.0';

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `http://${serverHostname}:${serverPort}/auth/github/callback`
}, (accessToken, refreshToken, profile, cb) => {
    return cb(null, profile);
}));

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});

bootHelper.standardizedBindingToApp({
    app,
    suffix: '/api/v1/',
    routes: [
        'github',
        'auth',
    ],
    middlewares: [
        cors(),
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }),
        passport.initialize(),
        passport.session()
    ],
    settings: {
        deactivated: [
            'x-powered-by'
        ]
    }
});

httpServer.listen(serverPort, serverHostname, async () => {
    await connectToMongoDb();
    console.log(`[Quantum Cloud]: Server running at http://${serverHostname}:${serverPort}/`);
});