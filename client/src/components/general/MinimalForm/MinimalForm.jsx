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

import React, { useState, useEffect } from 'react';
import Input from '@components/general/Input';
import Button from '@components/general/Button';
import Breadcrumbs from '@components/general/Breadcrumbs';
import AnimatedMain from '@components/general/AnimatedMain'
import { BiErrorCircle } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import { CircularProgress } from '@mui/material';
import './MinimalForm.css';

const MinimalForm = ({
    headerTitle,
    headerSubtitle,
    error,
    formInputs,
    submitButtonTitle,
    handleFormSubmit,
    RightContainerComponent = null,
    breadcrumbsItems = null,
    isLoading = false
}) => {
    const [formValues, setFormValues] = useState(
        formInputs.map(input => ({ [input.name]: input?.value || '' })).reduce((acc, cur) => ({ ...acc, ...cur }), {}));

    const keyPressHandler = (e) => {
        if(e.key === 'Enter'){
            handleFormSubmit(formValues);
        }
    };

    useEffect(() => {
        return () => {
            setFormValues(formInputs.map(input => ({ [input.name]: '' })));
        }
    }, []);

    return (
        <AnimatedMain 
            className='Minimal-Form-Container'
            style={{
                ...((formInputs.length > 3) && ({ height: 'unset' }))
            }}
        >
            <div className='Minimal-Form-Left-Container'>
                <div className='Minimal-Form-Header-Container'>
                    {breadcrumbsItems && (
                        <Breadcrumbs items={breadcrumbsItems} />
                    )}

                    <div className='Minimal-Form-Title-Container'>
                        <h1 className='Minimal-Form-Title'>{headerTitle}</h1>
                        <p className='Minimal-Form-Subtitle'>{headerSubtitle}</p>
                    </div>

                    {error?.length >= 1 && (
                        <div className='Minimal-Form-Error-Container'>
                            <i className='Minimal-Form-Error-Icon-Container'>
                                <BiErrorCircle />
                            </i>
                            <p className='Minimal-Form-Error'>{error}</p>
                        </div>
                    )}
                </div>

                <div className='Minimal-Form-Body-Container'>
                    {[...formInputs].map((input, index) => (
                        <Input 
                            key={index}
                            type={input.type}
                            value={formValues[input.name]}
                            onKeyPress={keyPressHandler}
                            onChange={(e) => setFormValues({ ...formValues, [input.name]: e.target.value })}
                            name={input.name}
                            helperText={input.helperText}
                            placeholder={input.placeholder} />
                    ))}
                </div>

                <div className='Minimal-Form-Footer-Container'>
                    <Button 
                        onClick={() => handleFormSubmit(formValues)}
                        title={submitButtonTitle} 
                        variant='Contained Black Extend Small-Border-Radius' 
                        icon={isLoading ? <CircularProgress/> : <BsArrowRight />} />
                </div>
            </div>

            <div className='Minimal-Form-Right-Container'>
                {RightContainerComponent && <RightContainerComponent />}
            </div>
        </AnimatedMain>
    );
};

export default MinimalForm;