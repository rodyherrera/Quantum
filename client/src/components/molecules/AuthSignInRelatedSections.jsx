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

import React from 'react';
import { TbDoorEnter } from 'react-icons/tb';
import { AiOutlineUserAdd } from 'react-icons/ai';
import RelatedItems from '@components/organisms/RelatedItems';

const AuthSignInRelatedSections = () => {
    const items = [
        {
            title: 'Connect with Quantum',
            icon: TbDoorEnter,
            description: 'Connect with your Quantum account and access the platform.',
            to: '/auth/sign-in/'
        },
        {
            title: 'Create Account',
            icon: AiOutlineUserAdd,
            description: 'Create an account on the platform and access all the features we have for you.',
            to: '/auth/sign-up/'
        }
    ];

    return <RelatedItems items={items} />
};

export default AuthSignInRelatedSections;