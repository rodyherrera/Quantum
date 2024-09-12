/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import prompts from 'prompts';
import User from '@models/user';

const createUser = async (): Promise<any> => {
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

export default createUser;