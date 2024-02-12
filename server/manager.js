const dotenv = require('dotenv');
const prompts = require('prompts');
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

const User = require('@models/user');
const mongoConnector = require('@utilities/mongoConnector');

const createUser = async () => {
    const data = await prompts([
        {
            type: 'text',
            name: 'username',
            message: 'Username'
        },
        {
            type: 'text',
            name: 'fullname',
            message: 'Your fullname'
        },
        {
            type: 'text',
            name: 'email',
            message: 'Email address'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Password'
        },
        {
            type: 'password',
            name: 'passwordConfirm',
            message: 'Confirm password'
        },
        {
            type: 'select',
            name: 'role',
            choices: [
                { title: 'User', value: 'user' },
                { title: 'Admin', value: 'admin' }
            ],
            message: 'Role'
        }
    ]);
    const newUser = await User.create(data);
    console.log('[Quantum Manager]: User created ->', newUser);
};

(async () => {
    await mongoConnector();

    const controllers = {
        createUser
    };

    const arguments = process.argv.slice(2);
    for(const argument of arguments){
        const controller = controllers[argument];
        if(!controller){
            console.log(`[Quantum Manager]: Invalid command "${argument}".`);
            continue;
        }
        controller();
    }
})();