const passport = require('passport');
const GithubStrategy = require('passport-github').Strategy;

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

module.exports = passport;