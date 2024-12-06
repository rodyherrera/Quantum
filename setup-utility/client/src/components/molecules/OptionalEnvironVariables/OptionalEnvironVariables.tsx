import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiArrowUpRight } from 'react-icons/hi2';
import { setEnvironVariables } from '@services/env/slice';
import Input from '@components/atoms/Input';
import './OptionalEnvironVariables.css';

const OptionalEnvironVariables = () => {
    const [isActive, setIsActive] = useState(false);
    const dispatch = useDispatch();
    const { environVariables } = useSelector((state: any) => state.env);

    const handleInputChange = (name: string, value: string) => {
        dispatch(setEnvironVariables({ ...environVariables, [name]: value }));
    };

    return (
        <div className='Optional-Environ-Variables-Container'>
            <div className='Optional-Environ-Variables-Header' onClick={() => setIsActive(!isActive)}>
                <h3 className='Optional-Environ-Variables-Title'>Optional</h3>
                <i className='Icon-Container'>
                    <HiArrowUpRight />
                </i>
            </div>

            {isActive && (
                <div className='Optional-Environ-Variables-Content'>
                    <Input
                        type='text'
                        value={environVariables.REGISTRATION_DISABLED || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('REGISTRATION_DISABLED', e.target.value)}
                        placeholder='REGISTRATION_DISABLED (true/false)'
                        helperText='If true, registration will be disabled.'
                    />

                    <Input
                        type='text'
                        value={environVariables.SMTP_HOST || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('SMTP_HOST', e.target.value)}
                        placeholder='SMTP Host (e.g., smtp.gmail.com)'
                        helperText='The host of the SMTP server.'
                    />

                    <Input
                        type='text'
                        value={environVariables.SMTP_PORT || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('SMTP_PORT', e.target.value)}
                        placeholder='SMTP Port (e.g., 587 for TLS).'
                        helperText='The port of the SMTP server.'
                    />

                    <Input
                        type='text'
                        value={environVariables.SMTP_USER || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('SMTP_USER', e.target.value)}
                        placeholder='SMTP User (e.g., no-reply@quantumapp.com)'
                        helperText='The user of the SMTP server.'
                    />

                    <Input
                        type='text'
                        value={environVariables.SMTP_PASSWORD || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('SMTP_PASSWORD', e.target.value)}
                        placeholder='SMTP Password (e.g., password123)'
                        helperText='The password of the SMTP server.'
                    />

                    <Input
                        type='text'
                        value={environVariables.WEBMASTER_EMAIL || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('WEBMASTER_EMAIL', e.target.value)}
                        placeholder='Webmaster Email (e.g., it-guy@quantumapp.com)'
                        helperText='Email address for error notifications.'
                    />
                </div>
            )}
        </div>
    );
};

export default OptionalEnvironVariables;