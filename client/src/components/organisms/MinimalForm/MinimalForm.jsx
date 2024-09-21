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

import React, { useState, useEffect, useRef } from 'react';
import Input from '@components/atoms/Input';
import Button from '@components/atoms/Button';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import AnimatedMain from '@components/atoms/AnimatedMain'
import Select from '@components/atoms/Select';
import { gsap } from 'gsap';
import { BiErrorCircle } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import { CircularProgress } from '@mui/material';
import './MinimalForm.css';

const MinimalForm = ({
    headerTitle,
    headerSubtitle,
    HeaderComponent = null,
    error,
    variant = '',
    formInputs,
    submitButtonTitle,
    handleFormSubmit,
    formImage = null,
    RightContainerComponent = null,
    breadcrumbsItems = null,
    isLoading = false
}) => {
    const [formValues, setFormValues] = useState(
        formInputs.map(input => ({ [input.name]: input?.value || '' })).reduce((acc, cur) => ({ ...acc, ...cur }), {}));
   
    // Array to hold input refs
    const inputRefs = useRef([]); 

    const keyPressHandler = (e) => {
        if(e.key === 'Enter'){
            handleFormSubmit(formValues);
        }
    };

    useEffect(() => {
        gsap.fromTo('.Minimal-Form-Container', {
            y: 20
        }, { 
            duration: 0.8, 
            y: 0, 
            ease: 'Power2.easeOut' 
        });
    
        gsap.fromTo(inputRefs.current, {
            y: 10,
            opacity: 0
        }, {
            duration: 0.4,
            opacity: 1,
            y: 0,
            stagger: 0.15,
            ease: 'Back.easeOut(1.2)'
        });
        return () => {
            setFormValues(formInputs.map(input => ({ [input.name]: input.type === 'select' ? [] : '' })));
        }
    }, []);

    useEffect(() => {
        if(error){
            gsap.fromTo('.Minimal-Form-Error-Container', { 
                opacity: 0,
                x: -10
            }, {
                duration: 0.4, 
                opacity: 1, 
                x: 0, 
                ease: 'Elastic.easeOut(1, 0.4)' 
            });
        }
    }, [error]);

    return (
        <AnimatedMain 
            className={'Minimal-Form-Container '.concat(variant)}
            style={{
                ...((formInputs.length >= 3) && ({ height: 'unset' }))
            }}
        >
            <div className='Minimal-Form-Left-Container'>
                <div className='Minimal-Form-Header-Container'>
                    {breadcrumbsItems && (
                        <Breadcrumbs items={breadcrumbsItems} />
                    )}

                    <div className='Minimal-Form-Title-Container'>
                        {HeaderComponent !== null ? (
                            <HeaderComponent />
                        ) : (
                            <React.Fragment>
                                <h1 className='Minimal-Form-Title'>{headerTitle}</h1>
                                <p className='Minimal-Form-Subtitle'>{headerSubtitle}</p>
                            </React.Fragment>
                        )}
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
                        input.type === 'select' ? (
                            <Select 
                                key={index}
                                type={input.type}
                                value={formValues[input.name]}
                                options={input.options}
                                ref={(el) => inputRefs.current[index] = el}
                                onKeyPress={keyPressHandler}
                                onSelect={(value) => {
                                    const newValue = input.multiSelect ? [...formValues[input.name], value] : value;
                                    setFormValues({ ...formValues, [input.name]: newValue });
                                }}
                                name={input.name}
                                helperText={input.helperText}
                                placeholder={input.placeholder} />
                        ) : (
                            <Input 
                                key={index}
                                type={input.type}
                                value={formValues[input.name]}
                                ref={(el) => inputRefs.current[index] = el}
                                onKeyPress={keyPressHandler}
                                onChange={(e) => setFormValues({ ...formValues, [input.name]: e.target.value })}
                                name={input.name}
                                helperText={input.helperText}
                                placeholder={input.placeholder} />
                        )
                    ))}
                </div>

                <div className='Minimal-Form-Footer-Container'>
                    <Button 
                        onClick={() => handleFormSubmit(formValues)}
                        title={submitButtonTitle} 
                        variant='Contained Black Extend Small-Border-Radius Mobile-Max-Expand' 
                        icon={isLoading ? <CircularProgress/> : <BsArrowRight />} />
                </div>
            </div>

            <div className='Minimal-Form-Right-Container'>
                {formImage !== null && (
                    <figure className='Form-Image-Container'>
                        <img className='Form-Image' src={formImage} />
                    </figure>
                )}
                {RightContainerComponent && <RightContainerComponent />}
            </div>
        </AnimatedMain>
    );
};

export default MinimalForm;