import React from 'react';
import MinimalForm from '@components/general/MinimalForm';
import { useSelector, useDispatch } from 'react-redux';
import { signUp } from '@services/authentication/actions';
import './SignUp.css';

const SignUp = () => {
    const { isLoading, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const handleFormSubmit = (formValues) => {
        dispatch(signUp(formValues));
    };

    return <MinimalForm
        headerTitle='Creating a new account'
        headerSubtitle="Tell us a little more about yourself..."
        submitButtonTitle='Create account'
        handleFormSubmit={handleFormSubmit}
        error={error}
        isLoading={isLoading}
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