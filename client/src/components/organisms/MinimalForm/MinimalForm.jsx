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

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CircularProgress } from '@mui/material';
import { gsap } from 'gsap';
import { BiErrorCircle } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import Input from '@components/atoms/Input';
import Button from '@components/atoms/Button';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import AnimatedMain from '@components/atoms/AnimatedMain';
import Select from '@components/atoms/Select';
import './MinimalForm.css';

/**
 * MinimalForm Component
 * A versatile form component with support for inputs, selects, custom headers, and loading overlays.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.headerTitle - The main title of the form.
 * @param {string} props.headerSubtitle - The subtitle or description of the form.
 * @param {React.Component} [props.HeaderComponent=null] - Optional custom header component.
 * @param {string} [props.error=''] - Error message to display.
 * @param {string} [props.variant=''] - Variant for styling the form.
 * @param {Array} props.formInputs - Array of form input configurations.
 * @param {string} props.submitButtonTitle - The title of the submit button.
 * @param {Function} props.handleFormSubmit - Function to handle form submission.
 * @param {string} [props.formImage=null] - URL of the image to display in the form.
 * @param {boolean} [props.overlayLoading=false] - Flag to show loading overlay.
 * @param {React.Component} [props.RightContainerComponent=null] - Optional component for the right container.
 * @param {string} [props.overlayLoadingMessage=''] - Message to display in the loading overlay.
 * @param {Array} [props.breadcrumbsItems=null] - Array of breadcrumb items.
 * @param {boolean} [props.isLoading=false] - Flag indicating if the form is in a loading state.
*/
const MinimalForm = ({
    headerTitle,
    headerSubtitle,
    HeaderComponent = null,
    error = '',
    variant = '',
    formInputs,
    submitButtonTitle,
    handleFormSubmit,
    formImage = null,
    overlayLoading = false,
    RightContainerComponent = null,
    overlayLoadingMessage = '',
    breadcrumbsItems = null,
    isLoading = false
}) => {
    const [formValues, setFormValues] = useState(() => {
        return formInputs.reduce((acc, input) => ({
            ...acc,
            [input.name]:
                input.value ||
                input.default ||
                (input.type === 'select' && input.multiSelect ? [] : '')
        }), {});
    });
    
    const inputRefs = useRef([]);

    /**
     * Handles form submission when the Enter key is pressed.
     *
     * @param {Object} e - The keyboard event.
    */
    const handleKeyPress = useCallback((e) => {
        if(e.key === 'Enter'){
            handleFormSubmit(formValues);
        }
    }, [handleFormSubmit, formValues]);

    /**
     * Initializes GSAP animations for the form and its inputs.
    */
    const initializeAnimations = useCallback(() => {
        // Animate the main form container
        gsap.fromTo(
            '.Minimal-Form-Container',
            { y: 20 },
            { duration: 0.8, y: 0, ease: 'Power2.easeOut' }
        );

        // Animate each input field
        gsap.fromTo(
            inputRefs.current,
            { y: 10, opacity: 0 },
            {
                duration: 0.4,
                opacity: 1,
                y: 0,
                stagger: 0.15,
                ease: 'Back.easeOut(1.2)'
            }
        );
    }, []);


    /**
     * Handles error animations when an error message is present.
    */
    const handleErrorAnimation = useCallback(() => {
        if(error){
            gsap.fromTo(
                '.Minimal-Form-Error-Container',
                { opacity: 0, x: -10 },
                { duration: 0.4, opacity: 1, x: 0, ease: 'Elastic.easeOut(1, 0.4)' }
            );
        }
    }, [error]);

    /**
     * Updates the value of a specific form input.
     *
     * @param {string} name - The name of the input field.
     * @param {any} value - The new value for the input field.
    */
    const updateFormValue = useCallback((name, value) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value
        }));
    }, []);

    /**
     * Renders form input fields based on the formInputs configuration.
     *
     * @returns {JSX.Element[]} Array of input components.
    */
    const renderFormInputs = useMemo(() => {
        return formInputs.map((input, index) => {
            const commonProps = {
                type: input.type,
                name: input.name,
                value: formValues[input.name],
                ref: (el) => inputRefs.current[index] = el,
                onKeyPress: handleKeyPress,
                helperText: input.helperText,
                placeholder: input.placeholder  
            };
            if(input.type === 'select'){
                return (
                    <Select
                        {...commonProps}
                        key={index}
                        inputProps={{ value: formValues[input.name] }}
                        options={input.options}
                        multiSelect={input.multiSelect}
                        onSelect={(value) => {
                            const newValue = input.multiSelect
                                ? [...formValues[input.name], value]
                                : value;
                            updateFormValue(input.name, newValue);
                        }}
                    />
                );
            }
            return (
                <Input
                    {...commonProps}
                    key={index}
                    onChange={(e) => updateFormValue(input.name, e.target.value)}
                />
            );
        });
    }, [formInputs, formValues, handleKeyPress, updateFormValue]);

    useEffect(() => {
        initializeAnimations();
        // Cleanup function to reset form values when the
        // component unmounts
        return () => {
            setFormValues(formInputs.reduce((acc, input) => ({
                ...acc,
                [input.name]: input.type === 'select' ? [] : ''
            }), {}));
        };
    }, []);

    useEffect(() => {
        handleErrorAnimation();
    }, [handleErrorAnimation]);

    return (
        <AnimatedMain 
            className={'Minimal-Form-Container '.concat(variant)}
            style={{
                ...((formInputs.length >= 3) && ({ height: 'unset' }))
            }}
        >
            {isLoading && overlayLoading && overlayLoadingMessage && (
                <div className='Overlay-Loading-Container'>
                    <CircularProgress className='Circular-Progress' />
                    <p className='Overlay-Loading-Message'>{overlayLoadingMessage}</p>
                </div>
            )}

            <div className='Minimal-Form-Left-Container'>
                <div className='Minimal-Form-Header-Container'>
                    {formImage && (
                        <figure className='Form-Image-Mobile-Container'>
                            <img className='Form-Image-Mobile' src={formImage} />
                        </figure>
                    )}
                    {breadcrumbsItems && (
                        <Breadcrumbs items={breadcrumbsItems} />
                    )}

                    <div className='Minimal-Form-Title-Container'>
                        {HeaderComponent ? (
                            <HeaderComponent />
                        ) : (
                            <React.Fragment>
                                <h1 className='Minimal-Form-Title'>{headerTitle}</h1>
                                <p className='Minimal-Form-Subtitle'>{headerSubtitle}</p>
                            </React.Fragment>
                        )}
                    </div>

                    {error && (
                        <div className='Minimal-Form-Error-Container'>
                            <i className='Minimal-Form-Error-Icon-Container'>
                                <BiErrorCircle />
                            </i>
                            <p className='Minimal-Form-Error'>{error}</p>
                        </div>
                    )}
                </div>

                <div className='Minimal-Form-Body-Container'>
                    {renderFormInputs}
                </div>

                <div className='Minimal-Form-Footer-Container'>
                    <Button 
                        type='submit'
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