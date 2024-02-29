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

import React, { useEffect } from 'react';
import MinimalForm from '@components/general/MinimalForm'
import { getMyProfile, updateMyProfile } from '@services/authentication/operations';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthenticatedUserRelatedSections from '@components/authentication/AuthenticatedUserRelatedSections'
import './Account.css';

// Implement Skeleton for data loading, for now 
// the user data is displayed and then simply updated 
// with new data from the server.
const AccountPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, error, isOperationLoading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getMyProfile());
    }, []);

    const handleFormSubmit = (formValues) => {
        dispatch(updateMyProfile(formValues, navigate));
    };

    return (
        <MinimalForm
            error={error}
            isLoading={isOperationLoading}
            submitButtonTitle='Save Changes'
            handleFormSubmit={handleFormSubmit}
            HeaderComponent={() => (
                <div id='Account-Page-Header-Title-Container'>
                    <h1 id='Account-Page-Header-Title'>
                        What would you<br/>like to do today,
                        <span id='Account-Page-Header-Title-User-First-Name'>{user.fullname.split(' ')[0]}?</span>
                    </h1>
                    <p id='Account-Page-Header-Description'>We appreciate the trust you place in us to host your applications.</p>
                </div>
            )}
            RightContainerComponent={AuthenticatedUserRelatedSections}
            breadcrumbsItems={[
                { title: 'Home', to: '/' },
                { title: 'Dashboard', to: '/dashboard/' },
                { title: `My Account (@${user.username})` , to: '/auth/account/' }
            ]}
            formInputs={[
                {
                    type: 'text',
                    name: 'fullname',
                    placeholder: 'What is your full name?',
                    helperText: 'We want to communicate from you to you, let us know your full name.',
                    value: user.fullname
                },
                {
                    type: 'text',
                    name: 'username',
                    placeholder: 'How do you like to be called?',
                    helperText: 'Your username is how others will identify you. Choose something memorable and unique!',
                    value: user.username
                },
                {
                    type: 'email',
                    name: 'email',
                    placeholder: 'What is your email address?',
                    helperText: 'Your email address will be used for communication and account verification purposes. Please provide a valid email address.',
                    value: user.email
                }
            ]}
        />
    );
};

export default AccountPage;