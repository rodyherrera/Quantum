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
import RelatedItems from '@components/general/RelatedItems';
import DeleteAccount from '@components/authentication/DeleteAccount';
import { GoGitPullRequest } from 'react-icons/go';
import { BsHddNetwork } from 'react-icons/bs';
import { RxUpdate } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import './AuthenticatedUserRelatedSections.css';

const AuthenticaticatedUserRelatedSections = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div id='Authenticated-User-Related-Sections'>
            <DeleteAccount />
            <RelatedItems
                items={[
                    {
                        title: `${user.repositories.length} repositories`,
                        description: 'Manage all your repositories hosted within the platform.',
                        icon: GoGitPullRequest,
                        to: '/dashboard/'
                    },
                    {
                        title: `${user.deployments.length} deployments`,
                        description: 'All deployments related to the repositories that you have hosted on the platform.',
                        icon: BsHddNetwork,
                        to: '/dashboard/'
                    },
                    {
                        title: 'Change Password',
                        description: 'Update your password and improve the security of your account in simple steps.',
                        icon: RxUpdate,
                        to: '/auth/account/change-password/'
                    }
                ]}
            />
        </div>
    );
};

export default AuthenticaticatedUserRelatedSections;