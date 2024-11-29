import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Loader from '@components/atoms/Loader';
import {
    DashboardModuleHeader,
    DashboardModuleFooter,
    DashboardModuleBody
} from '@components/atoms/DashboardModule';
import './DashboardModule.css';

const DashboardModule = ({
    Icon,
    title,
    total,
    results,
    createLink,
    RenderComponent,
    viewAll,
    isOperationLoading = false,
    alias = 'document(s)'
}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if(containerRef.current){
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            );
        }
    }, []);

    return (
        <div className='Dashboard-Module-Container' ref={containerRef}>
            {(isOperationLoading && results >= 1) && (
                <div className='Dashboard-Module-Operation-Loading-Container'>
                    <Loader scale='0.7' />
                </div>
            )}
            <DashboardModuleHeader Icon={Icon} title={title} createLink={createLink} />
            <DashboardModuleBody RenderComponent={RenderComponent} />
            <DashboardModuleFooter viewAll={viewAll} results={results} total={total} alias={alias} />
        </div>
    );
};

export default DashboardModule;
