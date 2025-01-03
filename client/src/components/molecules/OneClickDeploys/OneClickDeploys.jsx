import React from 'react';
import { TfiWorld } from "react-icons/tfi";
import { BsArrowRight } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { oneClickDeploy } from '@services/docker/container/operations';
import { addToast, TOAST_TYPES } from '@services/core/toastSlice';
import oneClickServicesConfig from '@assets/one-click-services.json';
import Loader from '@components/atoms/Loader';
import './OneClickDeploys.css';

const OneClickDeploys = () => {
    const dispatch = useDispatch();
    const { isOneClickDeployLoading } = useSelector((state) => state.dockerContainer);

    const deployHandler = (config) => {
        const onResponse = () => {
            if(!config?.notification) return;
            dispatch(addToast({
                persistent: true,
                title: config.notification.title,
                message: config.notification.message,
                type: TOAST_TYPES.SUCCESS
            }));
        };
        dispatch(oneClickDeploy({ config }, onResponse));
    };

    return (
        <React.Fragment>
            {(isOneClickDeployLoading) && (
                <div className='One-Click-Deploy-Loading-Container'>
                    <Loader scale='0.6' />
                </div>
            )}

            <div className='One-Click-Deploys-Container'>
                {oneClickServicesConfig.map((config, index) => (
                    <div className='One-Click-Deploy-Container' key={index} onClick={() => deployHandler(config)}>
                        <div className='One-Click-Deploy-Header-Container'>
                            <h3 className='One-Click-Deploy-Title'>{config.name}</h3>
                            <i className='One-Click-Deploy-Service-URL' onClick={() => window.open(config.website, '_blank')}>
                                <TfiWorld />
                            </i>
                        </div>
                        <div className='One-Click-Deploy-Footer-Container'>
                            <p className='One-Click-Deploy-Description'>{config.description}</p>
                            <i className='One-Click-Deploy-Arrow-Container'>
                                <BsArrowRight />
                            </i>
                        </div>
                    </div>
                ))}
            </div>
        </React.Fragment>
    );
};

export default OneClickDeploys;