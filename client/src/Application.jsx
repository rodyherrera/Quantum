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
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@components/general/Layout';
import ProtectedRoute from '@components/authentication/ProtectedRoute';
import pages from '@pages';

const Application = () => {
    const location = useLocation();
    return (
        <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
                <Route index element={<pages.everybody.general.Home />} />
                <Route path='/service-status/' element={<pages.everybody.general.ServiceStatus />} />
                <Route path='/legal/privacy-policy/' element={<pages.everybody.legal.PrivacyPolicy />} />

                <Route element={<ProtectedRoute mode='guest' />}>
                    <Route path='/auth/sign-up' element={<pages.guest.authentication.SignUp />} />
                    <Route path='/auth/sign-in' element={<pages.guest.authentication.SignIn />} />
                </Route>

                <Route element={<ProtectedRoute mode='protect' />}>
                    <Route path='/github/authenticate/' element={<pages.protected.github.Authenticate />} />
                    <Route path='/github/need-authenticate/' element={<pages.protected.github.NeedAuthenticate />} />

                    <Route path='/repository/create/' element={<pages.protected.repository.CreateRepository />} />
                    <Route path='/repository/:repositoryAlias/storage/' element={<pages.protected.repository.Storage />} />
                    <Route path='/repository/:repositoryAlias/deployments/' element={<pages.protected.repository.RepositoryDeployments />} />
                    <Route path='/repository/:repositoryAlias/deployment/setup/' element={<pages.protected.repository.SetupDeployment />} />
                    <Route path='/repository/:repositoryAlias/deployment/environment-variables/' element={<pages.protected.repository.EnvironmentVariables />} />
                    <Route path='/repository/:repositoryAlias/shell/' element={<pages.protected.repository.Shell />} />

                    <Route path='/dashboard/' element={<pages.protected.general.Dashboard />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default Application;