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

                <Route element={<ProtectedRoute mode='guest' />}>
                    <Route path='/auth/sign-up' element={<pages.guest.authentication.SignUp />} />
                    <Route path='/auth/sign-in' element={<pages.guest.authentication.SignIn />} />
                </Route>

                <Route element={<ProtectedRoute mode='protect' />}>
                    <Route path='/github/authenticate/' element={<pages.protected.github.Authenticate />} />
                    <Route path='/github/need-authenticate/' element={<pages.protected.github.NeedAuthenticate />} />

                    <Route path='/repository/create/' element={<pages.protected.repository.CreateRepository />} />
                    <Route path='/repository/:repositoryName/deployments/' element={<pages.protected.repository.RepositoryDeployments />} />
                    <Route path='/repository/:repositoryName/deployment/setup/' element={<pages.protected.repository.SetupDeployment />} />
                    <Route path='/repository/:repositoryName/terminal/' element={<pages.protected.repository.Terminal />} />

                    <Route path='/dashboard/' element={<pages.protected.general.Dashboard />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default Application;