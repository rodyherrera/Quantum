import React, { useState, useEffect } from 'react';
import Input from '@components/general/Input';
import Button from '@components/general/Button';
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
        <AnimatedMain className='Minimal-Form-Container'>
            <div className='Minimal-Form-Header-Container'>
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
                    variant='Contained Black Extend' 
                    icon={isLoading ? <CircularProgress/> : <BsArrowRight />} />
            </div>
        </AnimatedMain>
    );
};

export default MinimalForm;