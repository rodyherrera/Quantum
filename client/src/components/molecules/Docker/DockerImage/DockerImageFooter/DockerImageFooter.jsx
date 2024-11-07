import React from 'react';
import { DashboardCardFooter } from '@components/atoms/DashboardCard';
import { IoIosRemoveCircleOutline } from 'react-icons/io';
import { LiaEditSolid } from 'react-icons/lia';
import { useDispatch } from 'react-redux';
import { setState as dockerImageSetState } from '@services/docker/image/slice';
import useDeleteDockerImage from '@hooks/api/docker/useDeleteDockerImage';
import './DockerImageFooter.css';

const DockerImageFooter = ({ image }) => {
    const dispatch = useDispatch();
    const deleteDockerImage = useDeleteDockerImage(image._id);

    const selectDockerImage = () => {
        dispatch(dockerImageSetState({ path: 'selectedDockerImage', value: image }));
    };

    const options = [
        ['Delete', IoIosRemoveCircleOutline, null, deleteDockerImage],
        ['Edit', LiaEditSolid, `/docker-image/${image._id}/update`, selectDockerImage]
    ];

    return <DashboardCardFooter options={options} />
};

export default DockerImageFooter;