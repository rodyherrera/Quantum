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

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import { gsap } from 'gsap'; 
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import EnvironmentVariable from '@components/atoms/EnvironmentVariable';
import AnimatedMain from '@components/atoms/AnimatedMain';
import Button from '@components/atoms/Button';
import EnvironmentMobileActions from '@components/atoms/EnvironmentMobileActions';
import * as deploymentSlice from '@services/deployment/slice';
import * as deploymentOperations from '@services/deployment/operations';
import './EnvironmentVariables.css';

const EnvironmentVariables = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositoryAlias } = useParams();
    const { selectedRepository } = useSelector((state) => state.repository);
    const { 
        isEnvironmentLoading, 
        isOperationLoading, 
        environment } = useSelector((state) => state.deployment);

    useEffect(() => {
        initializeEnvironment();
        // Title Area Animations 
        gsap.fromTo('#Environment-Variables-Left-Title', {
            y: 30
        }, { 
            duration: 0.8, 
            y: 0, 
            stagger: 0.1, 
            ease: 'back' 
        });

        gsap.fromTo('#Environment-Variables-Left-Subtitle', {
            scale: 0.95
        }, {
            duration: 0.8,
            scale: 1,
            ease: 'power2.out'
        });

        // Environment Variable Items Animation
        gsap.fromTo('.Environment-Variable-Container', {
            // Slide in from the right
            x: 50
        }, { 
            x: 0,
            duration: 0.8, 
            stagger: 0.15,
             // Add a 'pop' effect
            ease: 'back(2)',
            scrollTrigger: {
                trigger: '.Environment-Variable-Container' 
            }
        });

        gsap.fromTo('#Environment-Variables-Navigation-Container button', {
            x: (index) => index === 0 ? -50 : 50
        }, {
            x: 0,
            duration: 0.8,
            // Slide in from opposite sides
            stagger: 0.1,
            ease: 'back(2)'
        }); 

        const addNewTween = gsap.to('#Environment-Variables-Create-New-Container', {
            scale: 1.05, 
            duration: 0.5, 
            ease: 'power1.out', 
            paused: true 
        });
        
        const mouseEnterHandler = () => addNewTween.play();
        const mouseLeaveHandler = () => addNewTween.reverse();
        const addNewContainer = document.getElementById('Environment-Variables-Create-New-Container');
        addNewContainer.addEventListener('mouseenter', mouseEnterHandler);
        addNewContainer.addEventListener('mouseleave', mouseLeaveHandler);
        
        return () => {
            addNewContainer.removeEventListener('mouseenter', mouseEnterHandler);
            addNewContainer.removeEventListener('mouseleave', mouseLeaveHandler);
        };
    }, []);

    useEffect(() => {
        if(isEnvironmentLoading) return;
        gsap.fromTo('.Environment-Variable-Container', {
            y: 20,
            opacity: 0
        }, { 
            duration: 0.8, 
            opacity: 1, 
            y: 0, 
            stagger: 0.15, 
            scrollTrigger: {
                trigger: '.Environment-Variable-Container' 
            }
        });
    }, [isEnvironmentLoading]);

    const initializeEnvironment = () => {
        if(!selectedRepository) return navigate('/dashboard/');
        dispatch(deploymentOperations.getActiveDeploymentEnvironment(selectedRepository.alias));
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
        dispatch(deploymentOperations.updateDeployment(
            environment._id, { environment: updatedEnvironment }, navigate));
    };

    const handleCreateNew = () => {
        const { variables } = environment;
        if(variables.length && !variables[0][0].length) return;
        const state = [ ['', ''], ...variables ];
        dispatch(deploymentSlice.setState({
            path: 'environment',
            value: { ...environment, variables: state }
        }));
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
                                { title: repositoryAlias, to: '/dashboard/' },
                                { title: 'Environment Variables', to: `/repository/${repositoryAlias}/deployment/environment-variables/` }
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
                        <CircularProgress className='Circular-Progress' />
                    </div>
                )}

                {(isEnvironmentLoading) ? (
                    <div id='Environment-Variables-Loader-Container'>
                        <CircularProgress className='Circular-Progress' />
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