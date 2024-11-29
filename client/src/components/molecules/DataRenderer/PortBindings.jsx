import React from 'react';
import useUserPortBindings from '@hooks/api/user/useUserPortBinding';
import DataRenderer from '@components/organisms/DataRenderer';
import PortBinding from '@components/organisms/PortBinding'
import DashboardModule from '@components/molecules/DashboardModule';
import { IoLogoDocker } from 'react-icons/io5';

const PortBindings = ({ ...props }) => {
    const { portBindings, isLoading, error, portBindingStats, isOperationLoading } = useUserPortBindings();

    return (
        <DashboardModule
            title='Port Bindings'
            isOperationLoading={isOperationLoading}
            createLink='/port-binding/create/'
            Icon={IoLogoDocker}
            alias='port(s)'
            viewAll='/port-binding/explore/'
            results={portBindingStats?.results?.total || 0}
            total={portBindings?.length}
            RenderComponent={() => (
                <DataRenderer
                    title='Port Binding'
                    error={error}
                    isLoading={isLoading}
                    data={portBindings}
                    emptyDataMessage="You have not created any port bindings yet."
                    emptyDataBtn={{
                        title: 'Create Port Binding',
                        to: '/port-binding/create/'
                    }}
                    useBasicLayout={true}
                    {...props}
                >
                    <div id='Dashboard-Port-Bindings'>
                        {portBindings.map((portBinding, index) => (
                            <PortBinding key={index} portBinding={portBinding} />
                        ))}
                    </div>
                </DataRenderer>
            )}
        />
    );
};

export default PortBindings;