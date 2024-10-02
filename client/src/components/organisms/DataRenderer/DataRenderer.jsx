import React, { useLayoutEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { gsap } from 'gsap';
import Button from '@components/atoms/Button';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import AnimatedMain from '@components/atoms/AnimatedMain';
import './DataRenderer.css';

const DataRenderer = ({
    children,
    title,
    description,
    error = null,
    data = [],
    useBasicLayout = false,
    emptyDataMessage = 'No data available',
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
        const tl = gsap.timeline();
        tl.fromTo('.Data-Renderer-Main', { y: 20 }, { duration: 0.1, y: 0, ease: 'power2.out' })
            .fromTo(
                ['.Data-Renderer-Header-Container', '.Data-Renderer-Body-Container'],
                { y: 10, opacity: 0 },
                { duration: 0.5, y: 0, opacity: 1, ease: 'power2.out', stagger: 0.1 });
    }, []);

    useLayoutEffect(() => {
        if(isLoading || isOperationLoading){
            gsap.fromTo('.Data-Renderer-Loading-Container', { opacity: 0 }, { duration: 0.4, opacity: 1 });
        }
    }, [isLoading, isOperationLoading]);

    const renderContent = () => {
        if(isLoading || isOperationLoading){
            return (
                <div className='Data-Renderer-Loading-Container'>
                    <CircularProgress className='Circular-Progress' />
                    {isOperationLoading && operationLoadingMessage && (
                        <p className='Data-Renderer-Operation-Loading-Message'>{operationLoadingMessage}</p>
                    )}
                </div>
            )
        }

        if(error){
            return (
                <div className='Data-Renderer-Error-Container'>
                    <p className='Data-Renderer-Error-Message'>{error}</p>
                </div>
            )
        }
    
        if(data.length === 0){
            return (
                <div className='Data-Renderer-Empty-Container'>
                    <p className='Data-Renderer-Empty-Message'>{emptyDataMessage}</p>
                    {emptyDataBtn && <Button {...emptyDataBtn} />}
                </div>
            )
        }
        
        return children;
    };

    if(useBasicLayout){
        return (
            <div className='Data-Renderer-Basic-Layout-Container'>
                {renderContent()}
            </div>
        );
    }

    return (
        <AnimatedMain {...props} className='Data-Renderer-Main Binary-View-Container'>
            <section className='Binary-View-Left-Container'>
                <article className='Data-Renderer-Header-Container'>
                    <div className='Data-Renderer-Header-Left-Container'>
                        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} />}
                        <div className='Data-Renderer-Header-Title-Container'>
                            <h1 className='Data-Renderer-Header-Title'>{title}</h1>
                            <p className='Data-Renderer-Header-Subtitle'>{description}</p>
                        </div>
                    </div>
                    {headerRightContainer && (
                        <div className='Data-Renderer-Header-Right-Container'>
                            {headerRightContainer()}
                        </div>
                    )}
                </article>

                <article className='Data-Renderer-Body-Container'>
                    {renderContent()}
                </article>
            </section>
            
            <section className='Binary-View-Right-Container'>
                {RightContainerComponent && <RightContainerComponent />}
            </section>
        </AnimatedMain>
    );
};

export default DataRenderer;