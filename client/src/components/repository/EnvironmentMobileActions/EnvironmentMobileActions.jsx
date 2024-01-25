import React from 'react';
import Button from '@components/general/Button';
import './EnvironmentMobileActions.css';

const EnvironmentMobileActions = ({ addNewVariableHandler }) => {
    return (
        <aside className='Mobile-Environment-Actions-Container'>
            <article className='Mobile-Environment-Actions'>
                <Button title='Add new variable' onClick={addNewVariableHandler} />
                <Button title='Save changes' variant='Contained' />
            </article>
        </aside>
    );
};

export default EnvironmentMobileActions;