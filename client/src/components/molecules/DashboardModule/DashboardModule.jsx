import React from 'react';
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
    alias = 'document(s)'
}) => {
    return (
        <div className='Dashboard-Module-Container'>
            <DashboardModuleHeader Icon={Icon} title={title} createLink={createLink} />
            <DashboardModuleBody RenderComponent={RenderComponent} />
            <DashboardModuleFooter results={results} total={total} alias={alias} />
        </div>
    );
};

export default DashboardModule;