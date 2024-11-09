import React from 'react';
import Button from '@components/atoms/Button';
import Breadcrumbs from '@components/molecules/Breadcrumbs';
import Loader from '@components/atoms/Loader';
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

    const renderContent = () => {
        if(isLoading || isOperationLoading){
            return (
                <div className='Data-Renderer-Loading-Container'>
                    <Loader scale='0.7' />
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