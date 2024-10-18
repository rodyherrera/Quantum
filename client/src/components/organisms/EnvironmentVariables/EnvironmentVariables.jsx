import React from 'react';
import { CircularProgress } from '@mui/material';
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
    handleCreateNew,
    isOperationLoading,
    isEnvironmentLoading,
    environment
}) => {

    return (
        <AnimatedMain id='Environment-Variables-Main'>
            <section id='Environment-Variables-Left-Container'>
                <article id='Environment-Variables-Left-Title-Container'>
                    <article id='Environment-Variables-Breadcrumbs-Container'>
                        <Breadcrumbs items={breadcrumbs} />
                    </article>

                    <h1 id='Environment-Variables-Left-Title'>{title}</h1>
                    <p id='Environment-Variables-Left-Subtitle'>{description}</p>
                </article>

                <article id='Environment-Variables-Actions-Container'>
                    <div id='Environment-Variables-Actions-Left-Container'>
                        <div id='Environment-Variables-Navigation-Container'>
                            <Button title='Go Back' onClick={() => navigate('/dashboard/')} />
                            <Button title='Save Changes' variant='Contained' onClick={handleSave} />
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
                    saveHandler={handleSave}
                    addNewVariableHandler={handleCreateNew} />}
        </AnimatedMain>
    );
};

export default EnvironmentVariables;