import React from 'react';
import useUserDockerNetworks from '@hooks/api/user/useUserDockerNetworks';
import DataRenderer from '@components/organisms/DataRenderer';
import DashboardModule from '@components/molecules/DashboardModule';
import { IoLogoDocker } from 'react-icons/io5';
import { DockerImage } from '@components/organisms/Docker';

const DockerImages = () => {
    const { dockerImages, isLoading, error } = useUserDockerNetworks();

    return (
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
        >
            <DashboardModule
                title='Docker Images'
                Icon={IoLogoDocker}
                alias='image(s)'
                createLink='/docker-image/create/'
                total={5}
                results={1}
                RenderComponent={() => (
                    <div id='Dashboard-Dockers-Image'>
                        {dockerImages.map((image, index) => (
                            <DockerImage image={image} key={index} />
                        ))}
                    </div>
                )}
            />
        </DataRenderer>
    );
};

export default DockerImages;