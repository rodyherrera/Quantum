import React from 'react';
import useUserDockerNetworks from '@hooks/api/user/useUserDockerNetworks';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { IoLogoDocker } from 'react-icons/io5';
import { DockerNetwork } from '@components/organisms/Docker';

const DockerNetworks = ({ ...props }) => {
    const { dockerNetworks, isLoading, error, stats } = useUserDockerNetworks();

    return (
        <DashboardModule
            title='Docker Networks'
            createLink='/docker-network/create/'
            Icon={IoLogoDocker}
            alias='network(s)'
            results={stats?.results?.total}
            total={dockerNetworks?.length}
            RenderComponent={() => (
                <DataRenderer
                    title='Docker Networks'
                    error={error}
                    isLoading={isLoading}
                    data={dockerNetworks}
                    emptyDataMessage="No Docker networks found."
                    emptyDataBtn={{
                        title: 'Create Docker Network',
                        to: '/docker-network/create/'
                    }}
                    useBasicLayout={true}
                    {...props}
                >
                    <div id='Dashboard-Dockers-Network'>
                        {dockerNetworks.map((network, index) => (
                            <DockerNetwork network={network} key={index} />
                        ))}
                    </div>
                </DataRenderer>
            )}
        />
    );
};

export default DockerNetworks;