const moduleAlias = require('module-alias');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

moduleAlias.addAliases({
    '@utilities': `${__dirname}/utilities/`,
    '@routes': `${__dirname}/routes/`,
    '@cli': `${__dirname}/cli/`,
    '@models': `${__dirname}/models/`,
    '@middlewares': `${__dirname}/middlewares/`,
    '@config': `${__dirname}/config/`,
    '@controllers': `${__dirname}/controllers/`
});