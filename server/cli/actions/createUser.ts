import prompts from 'prompts';
import User from '@models/user';
import validator from 'validator';

const createUser = async (): Promise<any> => {
    const data = await prompts([
        { 
            type: 'text', 
            name: 'username', 
            message: 'Username (8-16 characters)', 
            validate: value => value.length >= 8 && value.length <= 16 ? true : 'Username must be between 8 and 16 characters'
        },
        { 
            type: 'text', 
            name: 'fullname', 
            message: 'Your fullname (8-32 characters)', 
            validate: value => value.length >= 8 && value.length <= 32 ? true : 'Fullname must be between 8 and 32 characters'
        },
        { 
            type: 'text', 
            name: 'email', 
            message: 'Email address', 
            validate: value => validator.isEmail(value) ? true : 'Invalid email address'
        },
        { 
            type: 'password', 
            name: 'password', 
            message: 'Password (8-16 characters)'
        },
        { 
            type: 'password', 
            name: 'passwordConfirm', 
            message: 'Confirm password (must match password)'
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
    console.log('Quantum Manager: You have successfully created the user. Now through your username and password you can log in to the application');
    console.log('Quantum Manager: Happy Hacking', newUser.fullname, ' :)');
};

export default createUser;