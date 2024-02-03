import React, { useEffect } from 'react';
import MinimalForm from '@components/general/MinimalForm';
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
        error={error}
        handleFormSubmit={handleFormSubmit} 
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