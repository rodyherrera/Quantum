import React from 'react';
import { DockerImageHeader, DockerImageBody, DockerImageFooter } from '@components/molecules/Docker/DockerImage';
import { DashboardCard } from '@components/atoms/DashboardCard';
import { useDispatch, useSelector } from 'react-redux';
import { deleteDockerImage } from '@services/docker/image/operations';
import './DockerImage.css';

const DockerImage = ({ image }) => {
    const dispatch = useDispatch();
    const { dockerImages } = useSelector((state) => state.dockerImage);

    const handleDockerImageDelete = () => {
        dispatch(deleteDockerImage(image._id, dockerImages));
    };

    return (
        <DashboardCard>
            <DockerImageHeader image={image} />
            <DockerImageBody image={image} />
            <DockerImageFooter onDelete={handleDockerImageDelete} image={image} />
        </DashboardCard>
    );
};

export default DockerImage;