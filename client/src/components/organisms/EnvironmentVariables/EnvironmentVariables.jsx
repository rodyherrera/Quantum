import React, { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { gsap } from 'gsap'; 
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import EnvironmentVariable from '@components/atoms/EnvironmentVariable';
import AnimatedMain from '@components/atoms/AnimatedMain';
import Button from '@components/atoms/Button';
import EnvironmentMobileActions from '@components/atoms/EnvironmentMobileActions';
import './EnvironmentVariables';

const EnvironmentVariables = ({
    breadcrumbs,
    title,
    description,
    handleSave,
    updateHandler,
    isOperationLoading,
    isEnvironmentLoading,
    environment
}) => {
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

    useEffect(() => {
        // Title Area Animations 
        gsap.fromTo('.Environment-Variables-Left-Title', {
            y: 30
        }, { 
            duration: 0.8, 
            y: 0, 
            stagger: 0.1, 
            ease: 'back' 
        });

        gsap.fromTo('.Environment-Variables-Left-Subtitle', {
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

        gsap.fromTo('.Environment-Variables-Navigation-Container button', {
            x: (index) => index === 0 ? -50 : 50
        }, {
            x: 0,
            duration: 0.8,
            // Slide in from opposite sides
            stagger: 0.1,
            ease: 'back(2)'
        }); 

        const addNewTween = gsap.to('.Environment-Variables-Create-New-Container', {
            scale: 1.05, 
            duration: 0.5, 
            ease: 'power1.out', 
            paused: true 
        });

        const mouseEnterHandler = () => addNewTween.play();
        const mouseLeaveHandler = () => addNewTween.reverse();
        const addNewContainer = document.querySelector('.Environment-Variables-Create-New-Container');
        addNewContainer.addEventListener('mouseenter', mouseEnterHandler);
        addNewContainer.addEventListener('mouseleave', mouseLeaveHandler);

        return () => {
            addNewContainer.removeEventListener('mouseenter', mouseEnterHandler);
            addNewContainer.removeEventListener('mouseleave', mouseLeaveHandler);
        };
    }, []);

    const onEnvironmentUpdate = () => {
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
        handleSave(updatedEnvironment);
    };

    const onCreateNew = () => {
        if(environment.variables.length && !environment.variables[0][0].length) return;
        const state = [ ['', ''], ...environment.variables ];
        updateHandler(state);
    };

    return (
        <AnimatedMain className='Environment-Variables-Main'>
            <section className='Environment-Variables-Left-Container'>
                <article className='Environment-Variables-Left-Title-Container'>
                    <article className='Environment-Variables-Breadcrumbs-Container'>
                        <Breadcrumbs items={breadcrumbs} />
                    </article>

                    <h1 className='Environment-Variables-Left-Title'>{title}</h1>
                    <p className='Environment-Variables-Left-Subtitle'>{description}</p>
                </article>

                <article className='Environment-Variables-Actions-Container'>
                    <div className='Environment-Variables-Actions-Left-Container'>
                        <div className='Environment-Variables-Navigation-Container'>
                            <Button title='Go Back' onClick={() => navigate('/dashboard/')} />
                            <Button title='Save Changes' variant='Contained' onClick={onEnvironmentUpdate} />
                        </div>
                    </div>
                    <div className='Environment-Variables-Create-New-Container' onClick={onCreateNew}>
                        <h3 className='Environment-Variables-Create-New-Title'>Add new variable</h3>
                    </div>
                </article>
            </section>

            <section className='Environment-Variables-Body'>
                {(isOperationLoading) && (
                    <div className='Environment-Variables-Operation-Loading-Container'>
                        <CircularProgress className='Circular-Progress' />
                    </div>
                )}

                {(isEnvironmentLoading) ? (
                    <div className='Environment-Variables-Loader-Container'>
                        <CircularProgress className='Circular-Progress' />
                    </div>
                ) : (
                    (environment.variables.length === 0) ? (
                        <article className='Environment-Variables-Empty-Container'>
                            <h3 className='Environment-Variables-Empty-Title'>There are no environment variables to display.</h3>
                            <Button title='Create new variable' onClick={onCreateNew} variant='Contained' />
                        </article>
                    ) : (
                        <article className='Environment-Variables-Container'>
                            {environment.variables.map(([ key, value ], index) => (
                                <EnvironmentVariable
                                    value={value}
                                    environment={environment}
                                    onUpdateVariable={updateHandler}
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
                    saveHandler={onEnvironmentUpdate}
                    addNewVariableHandler={onCreateNew} />}
        </AnimatedMain>
    );
};

export default EnvironmentVariables;