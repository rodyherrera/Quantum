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
import AuthenticatedUserRelatedSections from '@components/organisms/AuthenticatedUserRelatedSections'
import { updateMyPassword } from '@services/authentication/operations';
import { useSelector, useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import './ChangePassword.css';

const ChangePassword = () => {
    const { error, loadingStatus } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleFormSubmit = (formValues) => {
        dispatch(updateMyPassword(formValues, navigate));
    };

    return (
        <MinimalForm
            error={error}
            isLoading={loadingStatus.isOperationLoading}
            submitButtonTitle='Save changes'
            handleFormSubmit={handleFormSubmit}
            headerTitle='Change Password'
            headerSubtitle='Update your password and improve the security of your account in simple steps.'
            RightContainerComponent={AuthenticatedUserRelatedSections}
            formInputs={[
                {
                    type: 'password',
                    name: 'passwordCurrent',
                    placeholder: 'What is your current password?',
                    helperText: 'You must enter your current password so we can verify that you are the owner of the account to proceed with the update.'
                },
                {
                    type: 'password',
                    name: 'password',
                    placeholder: 'Enter the new password for your account.',
                    helperText: 'Enter a secure and robust password, the integrity of your Quantum-hosted services will depend on this.'
                },
                {
                    type: 'password',
                    name: 'passwordConfirm',
                    placeholder: 'Enter your new password again.',
                    helperText: 'To finish the update, confirm the new password you want to assign to your account.'
                }
            ]}
        />
    );
};

export default ChangePassword;