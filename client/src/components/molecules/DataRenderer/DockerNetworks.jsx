import React from 'react';
import useUserDockerNetworks from '@hooks/api/user/useUserDockerNetworks';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { IoLogoDocker } from 'react-icons/io5';
import { DockerNetwork } from '@components/organisms/Docker';

const DockerNetworks = () => {
    const { dockerNetworks, isLoading, error } = useUserDockerNetworks();

    return (
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
        >
            <DashboardModule
                title='Docker Networks'
                createLink='/docker-network/create/'
                Icon={IoLogoDocker}
                alias='network(s)'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Dockers-Network'>
                        {dockerNetworks.map((network, index) => (
                            <DockerNetwork network={network} key={index} />
                        ))}
                    </div>
                )}
            />
        </DataRenderer>
    );
};

export default DockerNetworks;