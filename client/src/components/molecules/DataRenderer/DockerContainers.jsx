import React from 'react';
import useUserDockerContainers from '@hooks/api/user/useUserDockerContainers';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { IoLogoDocker } from 'react-icons/io5';
import { DockerContainer } from '@components/organisms/Docker';

const DockerContainers = ({ ...props }) => {
    const { dockerContainers, isLoading, error, stats, isOperationLoading } = useUserDockerContainers();

    return (
        <DashboardModule
            title='Docker Containers'
            Icon={IoLogoDocker}
            isOperationLoading={isOperationLoading}
            alias='container(s)'
            viewAll='/docker-container/explore/'
            createLink='/docker-container/create/'
            results={stats?.results?.total || 0}
            total={dockerContainers?.length}
            RenderComponent={() => (
                <DataRenderer
                    title='Docker Containers'
                    error={error}
                    isLoading={isLoading}
                    data={dockerContainers}
                    emptyDataMessage="No Docker containers found."
                    emptyDataBtn={{
                        title: 'Create Docker Container',
                        to: '/docker-container/create/'
                    }}
                    useBasicLayout={true}
                    {...props}
                >
                    <div id='Dashboard-Dockers-Container'>
                        {dockerContainers.map((container, index) => (
                            <DockerContainer key={index} container={container} />
                        ))}
                    </div>
                </DataRenderer>
            )}
        />
    );
};

export default DockerContainers;