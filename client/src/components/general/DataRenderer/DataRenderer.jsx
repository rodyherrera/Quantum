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
import { CircularProgress } from '@mui/material';
import Button from '@components/general/Button';
import Breadcrumbs from '@components/general/Breadcrumbs';
import AnimatedMain from '@components/general/AnimatedMain'
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
    ...props
}) => {

    return (
        <AnimatedMain className='Data-Renderer-Main' {...props}>
            <section className='Data-Renderer-Header-Container'>
                <article className='Data-Renderer-Header-Left-Container'>
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
                </article>
                {headerRightContainer !== null && (
                    <article className='Data-Renderer-Header-Right-Container'>
                        {headerRightContainer()}
                    </article>
                )}
            </section>

            <section className='Data-Renderer-Body-Container'>
                {isLoading || isOperationLoading ? (
                    <article className='Data-Renderer-Loading-Container'>
                        <CircularProgress className='Circular-Progress' />
                        {(isOperationLoading && operationLoadingMessage) && (
                            <p className='Data-Renderer-Operation-Loading-Message'>{operationLoadingMessage}</p>
                        )}
                    </article>
                ) : (
                    (data && data.length === 0) ? (
                        <article className='Data-Renderer-Empty-Container'>
                            <p className='Data-Renderer-Empty-Message'>{emptyDataMessage}</p>
                            <Button {...emptyDataBtn} />
                        </article>
                    ) : (
                        children
                    )
                )}
            </section>
        </AnimatedMain>
    );
};

export default DataRenderer;