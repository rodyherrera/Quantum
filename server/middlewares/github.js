const passport = require('passport');

exports.authenticate = passport.authenticate('github');
exports.authenticateCallback = passport.authenticate('github', { failureRedirect: '/login' });

module.exports = exports;