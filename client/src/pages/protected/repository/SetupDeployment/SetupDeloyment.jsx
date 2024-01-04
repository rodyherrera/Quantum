import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MinimalForm from '@components/general/MinimalForm/MinimalForm';
import './SetupDeployment.css';

const SetupDeployment = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if(!state?.repository)
            return navigate('/dashboard/');
        console.log(state);
    }, [state]);

    return <MinimalForm
        headerTitle='We are almost ready to deploy...'
        headerSubtitle='We need to know some information about your project.'
        formInputs={[
            {
                type: 'text',
                name: 'buildCommand',
                helperText: 'The command your framework provides for compiling your code. If your framework does not require a build, leave this field empty.',
                placeholder: '`yarn build`, `pnpm build`, `npm build`, or `bun build`'
            },
            {
                type: 'text',
                name: 'installCommand',
                helperText: 'The command that us used to install your project dependencies. If you do not need to install dependencies, leave this field empty.',
                placeholder: '`yarn install`, `pnpm install`, `npm install`, or `bun install`'
            },
            {
                type: 'text',
                name: 'startCommand',
                helperText: 'The command that us used to start your application. If you do not need to start your application, leave this field empty.',
                placeholder: '`yarn start`, `pnpm start`, `npm start`, or `bun start`'
            }
        ]}
        submitButtonTitle='Continue'
        handleFormSubmit={(e, formValues) => {
            e.preventDefault();
            console.log(formValues);
        }} />
};

export default SetupDeployment;