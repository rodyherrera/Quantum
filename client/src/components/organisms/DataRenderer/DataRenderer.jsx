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

import React, { useLayoutEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { gsap } from 'gsap';
import Button from '@components/atoms/Button';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import AnimatedMain from '@components/atoms/AnimatedMain'
import './DataRenderer.css';

const DataRenderer = ({ 
    children,
    title, 
    description, 
    error = null,
    data = null,
    emptyDataMessage = null,
    emptyDataBtn = null,
    isLoading = false,
    isOperationLoading = false,
    operationLoadingMessage = null,
    breadcrumbItems = null,
    headerRightContainer = null,
    RightContainerComponent = null,
    ...props
}) => {

    useLayoutEffect(() => {
        gsap.fromTo('.Data-Renderer-Main', { y: 20 }, {  duration: 0.8,  y: 0, ease: 'Power2.easeOut' });
        gsap.fromTo(
            ['.Data-Renderer-Header-Container', '.Data-Renderer-Body-Container'], 
            { y: 10 }, { duration: 0.5, y: 0, ease: 'Power2.easeOut', stagger: 0.1 });
    }, []);

    useLayoutEffect(() => {
        if(isLoading || isOperationLoading){
            gsap.fromTo('.Data-Renderer-Loading-Container', { opacity: 0 }, { duration: 0.4, opacity: 1 });
        }
    }, [isLoading, isOperationLoading, error, data]);

    return (
        <AnimatedMain {...props} className='Data-Renderer-Main Binary-View-Container'>
            <section className='Binary-View-Left-Container'>
                <article className='Data-Renderer-Header-Container'>
                    <div className='Data-Renderer-Header-Left-Container'>
                        {breadcrumbItems !== null && <Breadcrumbs items={breadcrumbItems} />}
                        <div className='Data-Renderer-Header-Title-Container'>
                            <h1 className='Data-Renderer-Header-Title'>{title}</h1>
                            <p className='Data-Renderer-Header-Subtitle'>{description}</p>
                        </div>
                        {error && (
                            <div className='Data-Renderer-Error-Container'>
                                <p className='Data-Renderer-Error-Message'>{error}</p>
                            </div>
                        )}
                    </div>
                    {headerRightContainer !== null && (
                        <div className='Data-Renderer-Header-Right-Container'>
                            {headerRightContainer()}
                        </div>
                    )}
                </article>

                <article className='Data-Renderer-Body-Container'>
                    {(isLoading || isOperationLoading) ? (
                        <div className='Data-Renderer-Loading-Container'>
                            <CircularProgress className='Circular-Progress' />
                            {(isOperationLoading && operationLoadingMessage) && (
                                <p className='Data-Renderer-Operation-Loading-Message'>{operationLoadingMessage}</p>
                            )}
                        </div>
                    ) : (
                        (data && data.length === 0) ? (
                            <div className='Data-Renderer-Empty-Container'>
                                <p className='Data-Renderer-Empty-Message'>{emptyDataMessage}</p>
                                <Button {...emptyDataBtn} />
                            </div>
                        ) : (
                            children
                        )
                    )}
                </article>
            </section>

            <section className='Binary-View-Right-Container'>
                {RightContainerComponent && <RightContainerComponent />}
            </section>
        </AnimatedMain>
    );
};

export default DataRenderer;