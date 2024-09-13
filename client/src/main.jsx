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
import ReactDOM from 'react-dom/client';
import Application from '@/Application.jsx';
import MultiProvider from '@components/atoms/MultiProvider';
import { BrowserRouter } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Provider } from 'react-redux';
import reduxStore from '@utilities/store';
import '@styles/general.css';

ReactDOM.createRoot(document.getElementById('QuantumCloud-ROOT')).render(
    <MultiProvider
        providers={[
            <AnimatePresence />,
            <BrowserRouter />,
            <Provider store={reduxStore} />
        ]}
    >
        <Application />
    </MultiProvider>
);