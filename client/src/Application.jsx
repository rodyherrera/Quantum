import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@components/organisms/Layout';
import ProtectedRoute from '@components/organisms/ProtectedRoute';
import * as pages from '@pages';

const Application = () => {
    const location = useLocation();

    React.useEffect(() => {
        window.scrollTo({ behavior: 'smooth', top: 0 });
    }, [location.pathname]);

    return (
        <Routes location={location} key={location.pathname}>
            <Route element={<Layout />}>
                <Route index element={<pages.everybody.general.Home />} />
                <Route path='/service-status' element={<pages.everybody.general.ServiceStatus />} />
                <Route path='/legal/privacy-policy' element={<pages.everybody.legal.PrivacyPolicy />} />

                <Route element={<ProtectedRoute mode='guest' />}>
                    <Route path='/auth/sign-up' element={<pages.guest.authentication.SignUp />} />
                    <Route path='/auth/sign-in' element={<pages.guest.authentication.SignIn />} />
                </Route>

                <Route element={<ProtectedRoute mode='protect' />}>
                    <Route path='/auth/account'>
                        <Route index element={<pages.protected.authentication.Account />} />
                        <Route path='change-password' element={<pages.protected.authentication.ChangePassword />} />
                    </Route>

                    <Route path='/github'>
                        <Route path='authenticate' element={<pages.protected.github.Authenticate />} />
                        <Route path='need-authenticate' element={<pages.protected.github.NeedAuthenticate />} />
                    </Route>

                    <Route path='/docker-container'>
                        <Route path='create' element={<pages.protected.docker.container.CreateDockerContainer />} />
                        <Route path=':dockerId/shell' element={<pages.protected.docker.container.Shell />} />
                    </Route>

                    <Route path='/port-binding/create' element={<pages.protected.portBinding.CreatePortBinding />} />

                    <Route path='/docker-image/create' element={<pages.protected.docker.image.CreateDockerImage />} />

                    <Route path='/docker-network/create' element={<pages.protected.docker.network.CreateDockerNetwork />} />

                    <Route path='/repository'>
                        <Route path='create' element={<pages.protected.repository.CreateRepository />} />
                        <Route path=':repositoryAlias'>
                            <Route path='storage' element={<pages.protected.repository.Storage />} />
                            <Route path='deployments' element={<pages.protected.repository.RepositoryDeployments />} />
                            <Route path='deployment'>
                            <Route path='setup' element={<pages.protected.repository.SetupDeployment />} />
                            <Route path='environment-variables' element={<pages.protected.general.EnvironmentVariables />} />
                            </Route>
                        </Route>
                    </Route>


                    <Route path='/dashboard' element={<pages.protected.general.Dashboard />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default Application;