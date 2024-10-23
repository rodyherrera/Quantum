import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import useDeleteDockerImage from '@hooks/api/docker/useDeleteDockerImage';
import './DockerImageFooter.css';

const DockerImageFooter = ({ image }) => {
    const deleteDockerImage = useDeleteDockerImage(image._id);

    const options = [
        ['Delete', IoIosRemoveCircleOutline, null, deleteDockerImage]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerImageFooter;