const { capitalizeToLowerCaseWithDelimitier } = require('../utilities/algorithms');

exports.standardizedBindingToApp = ({ app, routes, suffix, middlewares, settings }) => {
    middlewares.forEach((middleware) => app.use(middleware));
    routes.forEach((route) => {
        app.use(suffix + capitalizeToLowerCaseWithDelimitier(route), require(`../routes/${route}`));
    });
    settings.deactivated.forEach((deactivated) => app.disabled(deactivated));
};

module.exports = exports;