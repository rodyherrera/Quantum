const dotenv = require('dotenv');
const moduleAlias = require('module-alias');

dotenv.config({ path: './.env' });

moduleAlias.addAliases({
    '@utilities': `${__dirname}/utilities/`,
    '@routes': `${__dirname}/routes/`,
    '@models': `${__dirname}/models/`,
    '@middlewares': `${__dirname}/middlewares/`,
    '@config': `${__dirname}/config/`,
    '@controllers': `${__dirname}/controllers/`
});

const { connectToMongoDb } = require('@utilities/runtime');
const bootstrap = require('@utilities/bootstrap');
const server = require('@config/express');

const SERVER_PORT = process.env.SERVER_PORT || 8000;
const SERVER_HOST = process.env.SERVER_HOSTNAME || '0.0.0.0';

server.listen(SERVER_PORT, SERVER_HOST, async () => {
    await connectToMongoDb();
    await bootstrap.loadRepositoriesPTYs();
    console.log(`[Quantum Cloud]: Server running at http://${SERVER_HOST}:${SERVER_PORT}/.`);
});