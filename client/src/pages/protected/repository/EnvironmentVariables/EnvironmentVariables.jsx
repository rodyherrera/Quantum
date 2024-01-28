import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import Breadcrumbs from '@components/general/Breadcrumbs';
import EnvironmentVariable from '@components/repository/EnvironmentVariable';
import AnimatedMain from '@components/general/AnimatedMain';
import Button from '@components/general/Button';
import EnvironmentMobileActions from '@components/repository/EnvironmentMobileActions';
import * as deploymentSlice from '@services/deployment/slice';
import * as deploymentActions from '@services/deployment/actions';
import './EnvironmentVariables.css';

const EnvironmentVariables = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositoryName } = useParams();
    const { 
        isEnvironmentLoading, 
        isOperationLoading, 
        environment } = useSelector(state => state.deployment);

    useEffect(() => {
        initializeEnvironment();
    }, []);

    const initializeEnvironment = () => {
        if(!state?.repository) return navigate('/dashboard/');
        dispatch(deploymentActions.getActiveDeploymentEnvironment(state.repository.name));
    };

    const handleEnvironmentUpdate = () => {
        // When working with variables, they are contained 
        // within the "environment" object, obtained through the 
        // API. "environment" has a key called "variables", where 
        // the variables are contained by an object. In the 
        // client, we do not work directly with the object, but
        // we transform that variable object into an array so that 
        // "key:value" will now be [key, value]. For this reason, we must 
        // reverse this operation to send the update to the server.
        // Assuming environment.variables is the array you need to transform back to an object
        const variables = environment.variables.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
        const updatedEnvironment = { ...environment, variables };
        dispatch(deploymentActions.updateDeployment(
            environment._id, { environment: updatedEnvironment }, navigate));
    };

    const handleCreateNew = () => {
        const { variables } = environment;
        if(variables.length && !variables[0][0].length) return;
        const state = [ ['', ''], ...variables ];
        dispatch(deploymentSlice.setEnvironment({ ...environment, variables: state }));
    };

    return (
        <AnimatedMain id='Environment-Variables-Main'>
            <section id='Environment-Variables-Left-Container'>
                <article id='Environment-Variables-Left-Title-Container'>
                    <article id='Environment-Variables-Breadcrumbs-Container'>
                        <Breadcrumbs
                            items={[
                                { title: 'Home', to: '/' },
                                { title: 'Dashboard', to: '/dashboard/' },
                                { title: repositoryName, to: '/dashboard/' },
                                { title: 'Environment Variables', to: `/repository/${repositoryName}/deployment/environment-variables/` }
                            ]} />
                    </article>

                    <h1 id='Environment-Variables-Left-Title'>Environment Variables</h1>
                    <p id='Environment-Variables-Left-Subtitle'>To provide your implementation with environment variables at compile and run time, you can enter them right here. If there are any .env files in the root of your repository, these are mapped and loaded automatically when deploying.</p>
                </article>

                <article id='Environment-Variables-Actions-Container'>
                    <div id='Environment-Variables-Actions-Left-Container'>
                        <div id='Environment-Variables-Navigation-Container'>
                            <Button title='Go Back' onClick={() => navigate('/dashboard/')} />
                            <Button title='Save Changes' variant='Contained' onClick={handleEnvironmentUpdate} />
                        </div>
                    </div>
                    <div id='Environment-Variables-Create-New-Container' onClick={handleCreateNew}>
                        <h3 id='Environment-Variables-Create-New-Title'>Add new variable</h3>
                    </div>
                </article>
            </section>

            <section id='Environment-Variables-Body'>
                {(isOperationLoading) && (
                    <div id='Environment-Variables-Operation-Loading-Container'>
                        <CircularProgress size='2.5rem' />
                    </div>
                )}

                {(isEnvironmentLoading) ? (
                    <div id='Environment-Variables-Loader-Container'>
                        <CircularProgress size='2.5rem' />
                    </div>
                ) : (
                    (environment.variables.length === 0) ? (
                        <article id='Environment-Variables-Empty-Container'>
                            <h3 id='Environment-Variables-Empty-Title'>There are no environment variables to display.</h3>
                            <Button title='Create new variable' onClick={handleCreateNew} variant='Contained' />
                        </article>
                    ) : (
                        <article id='Environment-Variables-Container'>
                            {environment.variables.map(([ key, value ], index) => (
                                <EnvironmentVariable
                                    value={value}
                                    index={index}
                                    name={key}
                                    key={index} />
                            ))}
                        </article>
                    )
                )}
            </section>
        
            {!isEnvironmentLoading && 
                <EnvironmentMobileActions 
                    saveHandler={handleEnvironmentUpdate}
                    addNewVariableHandler={handleCreateNew} />}
        </AnimatedMain>
    );
};

export default EnvironmentVariables;