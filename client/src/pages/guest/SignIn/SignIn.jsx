import React, { useContext } from 'react';
import MinimalForm from '@components/general/MinimalForm';
import { AuthenticationContext } from '@services/authentication/context';
import { useSelector } from 'react-redux';
import './SignIn.css';

const SignIn = () => {
    const { isLoading } = useSelector(state => state.authentication);
    const { signIn } = useContext(AuthenticationContext);

    const handleFormSubmit = (e, formValues) => {
        e.preventDefault();
        signIn(formValues);
    };

    return <MinimalForm 
        headerTitle='Welcome back!'
        headerSubtitle='We are glad to see you again.'
        submitButtonTitle='Sign in'
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