import React from 'react';
import ReactDOM from 'react-dom/client';
import Application from './Application.jsx';
import { MultiProvider } from 'react-pendulum';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('QuantumCloud-ROOT')).render(
    <MultiProvider
        providers={[
            <BrowserRouter />
        ]}
    >
        <Application />
    </MultiProvider>
);