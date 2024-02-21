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
import MinimalForm from '@components/general/MinimalForm';
import AuthSignInRelatedSections from '@components/authentication/AuthSignInRelatedSections';
import { signIn } from '@services/authentication/operations';
import { useSelector, useDispatch } from 'react-redux';
import './SignIn.css';

const SignIn = () => {
    const { isLoading, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const handleFormSubmit = (formValues) => {
        dispatch(signIn(formValues));
    };

    return <MinimalForm 
        headerTitle='Welcome back!'
        headerSubtitle='We are glad to see you again.'
        submitButtonTitle='Sign in'
        breadcrumbsItems={[
            { title: 'Home', to: '/' },
            { title: 'Authentication', to: '/' },
            { title: 'Connecting to your Quantum account', to: '/auth/sign-up/' }
        ]}
        error={error}
        handleFormSubmit={handleFormSubmit} 
        RightContainerComponent={AuthSignInRelatedSections}
        isLoading={isLoading}
        formInputs={[
            { 
                type: 'email', 
                name: 'email', 
                helperText: "We'd like to stay in touch. Don't worry, we respect your privacy and will use it responsibly.",
                placeholder: 'Enter your email address.'
            },
            { 
                type: 'password', 
                name: 'password', 
                helperText: "We take your privacy seriously. Your password will be encrypted and stored securely.",
                placeholder: 'Enter your password.'
            }
        ]} 
    />
};

export default SignIn;