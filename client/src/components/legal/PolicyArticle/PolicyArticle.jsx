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

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import './PolicyArticle.css';

const PolicyArticle = ({ content, title = null }) => {
    const articleRef = useRef(null);

    useEffect(() => {
        if(!articleRef.current) return;
        gsap.from(articleRef.current, {
            opacity: 0,
            y: 10,
            duration: 0.8,
            ease: 'power1.out'
        });
    }, [articleRef]);

    return (
        <div className='Privacy-Policy-Article-Container' ref={articleRef}>
            <p className='Privacy-Policy-Article'>
                {title && (
                    <b className='Privacy-Policy-Article-Title'>{title}:</b>
                )}
                <span className='Privacy-Policy-Article-Content'>{content}</span>
            </p>
        </div>
    );
};

export default PolicyArticle;