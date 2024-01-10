import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import EnvironmentVariable from '@components/repository/EnvironmentVariable';
import Button from '@components/general/Button';
import * as deploymentSlice from '@services/deployment/slice';
import * as deploymentActions from '@services/deployment/actions';
import './EnvironmentVariables.css';

const EnvironmentVariables = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { environmentVariables, isEnvironmentLoading } = useSelector(state => state.deployment);
    const [selectedVariable, setSelectedVariable] = useState(null);

    useEffect(() => {
        if(!state?.repository)
            return navigate('/dashboard/');
        dispatch(deploymentActions.getActiveDeploymentEnvironment(state.repository.name));
        return () => {
            setSelectedVariable(null);
        };
    }, []);

    const handleCreateNew = () => {
        const lastInserted = environmentVariables[0];
        const [key] = lastInserted;
        if(!key.length) return;
        const state = [ ['', ''], ...environmentVariables ];
        dispatch(deploymentSlice.setEnvironmentVariables(state));
    };

    return (
        <main id='Environment-Variables-Main'>
            <section id='Environment-Variables-Left-Container'>
                <article id='Environment-Variables-Left-Title-Container'>
                    <h1 id='Environment-Variables-Left-Title'>Environment Variables</h1>
                    <p id='Environment-Variables-Left-Subtitle'>To provide your implementation with environment variables at compile and run time, you can enter them right here. If there are any .env files in the root of your repository, these are mapped and loaded automatically when deploying.</p>
                </article>

                <article id='Environment-Variables-Actions-Container'>
                    <div id='Environment-Variables-Actions-Left-Container'>
                        <div id='Environment-Variables-Delete-Container' data-isvariableselected={selectedVariable !== null}>
                            <h3 id='Environment-Variables-Delete-Title'>
                                {selectedVariable 
                                    ? 'Delete "' + selectedVariable + '"' 
                                    : 'Select a variable for delete'}
                            </h3>
                        </div>
                        <div id='Environment-Variables-Navigation-Container'>
                            <Button title='Go Back' />
                            <Button title='Save Changes' variant='Contained' />
                        </div>
                    </div>
                    <div id='Environment-Variables-Create-New-Container' onClick={handleCreateNew}>
                        <h3 id='Environment-Variables-Create-New-Title'>Add new variable</h3>
                    </div>
                </article>
            </section>

            <section id='Environment-Variables-Body'>
                {(isEnvironmentLoading) ? (
                    <div id='Environment-Variables-Loader-Container'>
                        <CircularProgress size='2.5rem' />
                    </div>
                ) : (
                    <article id='Environment-Variables-Container'>
                        {environmentVariables.map(([ key, value ], index) => (
                            <EnvironmentVariable
                                onClick={() => setSelectedVariable(key)}
                                value={value}
                                index={index}
                                name={key}
                                key={index} />
                        ))}
                    </article>
                )}
            </section>
        </main>
    );
};

export default EnvironmentVariables;