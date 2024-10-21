import React, { useCallback, useEffect, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import { gsap } from 'gsap'; 
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import EnvironmentVariable from '@components/atoms/EnvironmentVariable';
import AnimatedMain from '@components/atoms/AnimatedMain';
import Button from '@components/atoms/Button';
import EnvironmentMobileActions from '@components/atoms/EnvironmentMobileActions';
import './EnvironmentVariables.css';

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
    const initAnimations = useCallback(() => {
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

        // Add New Variable Button Animation
        const addNewTween = gsap.to('.Environment-Variables-Create-New-Container', {
            scale: 1.05,
            duration: 0.5,
            ease: 'power1.out',
            paused: true
        });

        const handleMouseEnter = () => addNewTween.play();
        const handleMouseLeave = () => addNewTween.reverse();

        const addNewElement = document.querySelector('.Environment-Variables-Create-New-Container');
        addNewElement.addEventListener('mouseenter', handleMouseEnter);
        addNewElement.addEventListener('mouseleave', handleMouseLeave);

        // Cleanup Event Listeners on Unmount
        return () => {
            addNewElement.removeEventListener('mouseenter', handleMouseEnter);
            addNewElement.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    useEffect(() => {
        const cleanupAnimations = initAnimations();
        return () => {
            if(cleanupAnimations){
                cleanupAnimations();
            }
        };
    }, [initAnimations]);

    const onEnvironmentUpdate = useCallback(() => {
        if(!environment || !environment.variables){
            console.error('Environment data is missing.');
            return;
        }
        // Transform variables array back to object
        const variablesObject = environment.variables.reduce((acc, [key, value]) => {
            if(key.trim() !== ''){
                acc[key] = value;
            }
            return acc;
        }, {});
        const updatedEnvironment = { ...environment, variables: variablesObject };
        handleSave(updatedEnvironment);
    }, [environment, handleSave]);

    const onCreateNew = useCallback(() => {
        if(environment.variables.length && !environment.variables[0][0].length) return;
        const state = [ ['', ''], ...environment.variables ];
        updateHandler(state);
    }, [environment?.variables, updateHandler]);

    const renderEnvironVariables = useMemo(() => {
        return environment?.variables?.map(([ key, value ], index) => (
            <EnvironmentVariable
                key={index}
                name={key}
                value={value}
                environment={environment}
                onUpdateVariable={updateHandler}
                index={index}
            />
        ));
    }, [environment, updateHandler]);

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
                            {renderEnvironVariables}
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