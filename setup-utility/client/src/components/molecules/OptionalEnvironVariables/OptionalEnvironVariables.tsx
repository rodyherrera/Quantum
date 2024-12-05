import { useState } from 'react';
import { HiArrowUpRight } from 'react-icons/hi2';
import Input from '@components/atoms/Input';
import './OptionalEnvironVariables.css';

const OptionalEnvironVariables = () => {
    const [isActive, setIsActive] = useState(false);

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
                        placeholder='REGISTRATION_DISABLED (true/false)'
                        helperText='If true, registration will be disabled.'
                    />

                    <Input
                        type='text'
                        placeholder='SMTP Host (e.g., smtp.gmail.com)'
                        helperText='The host of the SMTP server.'
                    />

                    <Input
                        type='text'
                        placeholder='SMTP Port (e.g., 587 for TLS).'
                        helperText='The port of the SMTP server.'
                    />

                    <Input
                        type='text'
                        placeholder='SMTP User (e.g., no-reply@quantumapp.com)'
                        helperText='The user of the SMTP server.'
                    />

                    <Input
                        type='text'
                        placeholder='SMTP Password (e.g., password123)'
                        helperText='The password of the SMTP server.'
                    />

                    <Input
                        type='text'
                        placeholder='Webmaster Email (e.g., it-guy@quantumapp.com)'
                        helperText='Email address for error notifications.'
                    />
                </div>
            )}
        </div>
    );
};

export default OptionalEnvironVariables;