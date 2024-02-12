const prompts = require('prompts');
const User = require('@models/user');

const createUser = async () => {
    const data = await prompts([
        { type: 'text', name: 'username', message: 'Username' },
        { type: 'text', name: 'fullname', message: 'Your fullname' },
        { type: 'text', name: 'email', message: 'Email address' },
        { type: 'password', name: 'password', message: 'Password' },
        { type: 'password', name: 'passwordConfirm', message: 'Confirm password' },
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

module.exports = createUser;