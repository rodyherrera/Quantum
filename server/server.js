const dotenv = require('dotenv');
const moduleAlias = require('module-alias');

global.ptyStore = {};

dotenv.config({ path: './.env' });

moduleAlias.addAliases({
    '@utilities': `${__dirname}/utilities/`,
    '@routes': `${__dirname}/routes/`,
    '@models': `${__dirname}/models/`,
    '@middlewares': `${__dirname}/middlewares/`,
    '@config': `${__dirname}/config/`,
    '@controllers': `${__dirname}/controllers/`
});

const { httpServer } = require('@config/express');
const mongoConnector = require('@utilities/mongoConnector');
const bootstrap = require('@utilities/bootstrap');

require('@config/ws');

const SERVER_PORT = process.env.SERVER_PORT || 8000;
const SERVER_HOST = process.env.SERVER_HOSTNAME || '0.0.0.0';

httpServer.listen(SERVER_PORT, SERVER_HOST, async () => {
    await mongoConnector();
    await bootstrap.loadRepositoriesPTYs();
    console.log(`[Quantum Cloud]: Server running at http://${SERVER_HOST}:${SERVER_PORT}/.`);
});