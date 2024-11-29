import React from 'react';
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
    return (
        <div className='Dashboard-Module-Container'>
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