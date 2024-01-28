import React, { useState, useEffect } from 'react';
import Input from '@components/general/Input';
import Button from '@components/general/Button';
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

    useEffect(() => {
        return () => {
            setFormValues(formInputs.map(input => ({ [input.name]: '' })));
        }
    }, []);

    return (
        <form className='Minimal-Form-Container' onSubmit={(e) => handleFormSubmit(e, formValues)}>
            <div className='Minimal-Form-Header-Container'>
                <div className='Minimal-Form-Title-Container'>
                    <h1 className='Minimal-Form-Title'>{headerTitle}</h1>
                    <p className='Minimal-Form-Subtitle'>{headerSubtitle}</p>
                </div>

                {error?.length >= 1 && (
                    <div className='Minimal-Form-Error-Container'>
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
                        onChange={(e) => setFormValues({ ...formValues, [input.name]: e.target.value })}
                        name={input.name}
                        helperText={input.helperText}
                        placeholder={input.placeholder} />
                ))}
            </div>

            <div className='Minimal-Form-Footer-Container'>
                <Button 
                    type='submit'
                    title={submitButtonTitle} 
                    variant='Contained Black Extend' 
                    icon={isLoading ? <CircularProgress/> : <BsArrowRight />} />
            </div>
        </form>
    );
};

export default MinimalForm;