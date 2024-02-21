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

import React from 'react';
import './WhenCreatingAccount.css';

const WhenCreatingAccount = () => {

    return (
        <div className='Sign-Up-Information-Container'>
            <div className='Sign-Up-Information-Header-Container'>
                <h3 className='Sign-Up-Information-Header-Title'>
                    <span>When</span>
                    <span className='Sign-Up-Information-Header-Title-Highlight'>you create</span>
                    <span>an account</span>
                </h3>
            </div>
            <div className='Sign-Up-Information-Body'>
                {[
                    'You will be enabled an isolated instance of Alpine Linux where you can deploy all your services.',
                    "You can access your dedicated server via the 'Cloud Console' option we offer, just as you can access the shell associated with each repository within your instance.",
                    'We will automate and update your services so that they always remain active and up to date.',
                    'Please be patient, as the process may take a few seconds...'
                ].map((content, index) => (
                    <p className='Sign-Up-Information-Article' key={index}>{content}</p>
                ))}
            </div>
        </div>
    );
};

export default WhenCreatingAccount;