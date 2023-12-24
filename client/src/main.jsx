import React from 'react';
import ReactDOM from 'react-dom/client';
import Application from '@/Application.jsx';
import { MultiProvider } from 'react-pendulum';
import { AuthenticationProvider } from '@services/authentication/context';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import reduxStore from '@utilities/store';
import '@styles/general.css';

ReactDOM.createRoot(document.getElementById('QuantumCloud-ROOT')).render(
    <MultiProvider
        providers={[
            <BrowserRouter />,
            <Provider store={reduxStore} />,
            <AuthenticationProvider />
        ]}
    >
        <Application />
    </MultiProvider>
);