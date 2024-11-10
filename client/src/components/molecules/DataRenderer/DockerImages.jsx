import React from 'react';
import useUserDockerImages from '@hooks/api/user/useUserDockerImages';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { IoLogoDocker } from 'react-icons/io5';
import { DockerImage } from '@components/organisms/Docker';

const DockerImages = ({ ...props }) => {
    const { dockerImages, isLoading, error, stats, isOperationLoading } = useUserDockerImages();

    return (
        <DashboardModule
            title='Docker Images'
            isOperationLoading={isOperationLoading}
            Icon={IoLogoDocker}
            alias='image(s)'
            createLink='/docker-image/create/'
            results={stats?.results?.total}
            total={dockerImages?.length}
            RenderComponent={() => (
                <DataRenderer
                    title='Docker Images'
                    error={error}
                    isLoading={isLoading}
                    data={dockerImages}
                    emptyDataMessage="No Docker images found."
                    emptyDataBtn={{
                        title: 'Create Docker Image',
                        to: '/docker-image/create/'
                    }}
                    useBasicLayout={true}
                    {...props}
                >
                    <div id='Dashboard-Dockers-Image'>
                        {dockerImages?.map((image, index) => (
                            <DockerImage image={image} key={index} />
                        ))}
                    </div>
                </DataRenderer>
            )}
        />
    );
};

export default DockerImages;