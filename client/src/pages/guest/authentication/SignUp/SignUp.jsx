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
import MinimalForm from '@components/organisms/MinimalForm';
import AuthSignInRelatedSections from '@components/molecules/AuthSignInRelatedSections';
import WhenCreatingAccount from '@components/organisms/WhenCreatingAccount';
import { useSelector, useDispatch } from 'react-redux';
import { useDocumentTitle } from '@hooks/common';
import { signUp } from '@services/authentication/operations';
import './SignUp.css';

const SignUp = () => {
    const { loadingStatus, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    useDocumentTitle('Sign Up');

    const handleFormSubmit = (formValues) => {
        dispatch(signUp(formValues));
    };

    return <MinimalForm
        headerTitle='Creating a new account'
        headerSubtitle="Tell us a little more about yourself..."
        submitButtonTitle='Create account'
        breadcrumbsItems={[
            { title: 'Home', to: '/' },
            { title: 'Authentication', to: '/' },
            { title: 'Create a new account', to: '/auth/sign-up/' }
        ]}
        RightContainerComponent={() => (
            <div id='Sign-Up-Right-Container-Component'>
                <AuthSignInRelatedSections />
                <WhenCreatingAccount />
            </div>
        )}
        handleFormSubmit={handleFormSubmit}
        error={error}
        isLoading={loadingStatus.isLoading}
        formInputs={[
            { 
                type: 'email', 
                name: 'email', 
                helperText: "We'd like to stay in touch. Don't worry, we respect your privacy and will use it responsibly.",
                placeholder: 'Enter your email address.'
            },
            { 
                type: 'text', 
                name: 'fullname', 
                helperText: "To make our interactions more personal, we'd love to know your full name.",
                placeholder: 'What is your full name?'
            },
            { 
                type: 'text', 
                name: 'username', 
                helperText: "Feel free to share a name or any term you're comfortable with. This helps us personalize our interactions with you. 😊",
                placeholder: 'What is your nickname, how can we call you?'
            },
            { 
                type: 'password', 
                name: 'password', 
                helperText: "We take your privacy seriously. Your password will be encrypted and stored securely.",
                placeholder: 'Enter your password.'
            },
            { 
                type: 'password', 
                name: 'passwordConfirm', 
                helperText: "To ensure the security of your account, please re-enter your password for confirmation. Double-check to make sure it matches your initial password.",
                placeholder: 'Confirm your password.'
            }
        ]}
    />
};

export default SignUp;