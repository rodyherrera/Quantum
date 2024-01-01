import React from 'react';
import { BsCalendarDate } from 'react-icons/bs';
import { IoIosMore } from 'react-icons/io';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import * as deploymentActions from '@services/deployment/actions';
import './DeploymentItem.css';

const DeploymentItem = ({ deployment, repositoryName }) => {
    const dispatch = useDispatch();

    const formatDate = (date) => {
        const dateNow = new Date();
        const dateThen = new Date(date);
        const difference = dateNow - dateThen;
        const hours = Math.floor(difference / 1000 / 60 / 60);
        const days = Math.floor(hours / 24);
        if(hours < 24){
            return `${hours} hours ago`;
        }
        return `${days} days ago`;
    };

    return (
        <div className='Repository-Deployment-Container'>
            <div className='Repository-Deployment-Left-Container'>
                <div className='Repository-Deployment-Top-Container'>
                    <h3 className='Repository-Deployment-Id'>{deployment.id}</h3>
                    <p className='Repository-Deployment-Environment'>{deployment.environment}</p>
                </div>
                <div className='Repository-Deployment-Created-At-Container'>
                    <i className='Repository-Deployment-Created-At-Icon'>
                        <BsCalendarDate />
                    </i>
                    <span className='Repository-Deployment-Created-At-Name'>{formatDate(deployment.created_at)}</span>
                </div>
            </div>

            <div className='Repository-Deployment-Extras-Container'>
                <figure className='Repository-Deployment-User-Image-Container' onClick={() => window.open(deployment.creator.html_url, '_blank')}>
                    <img className='Repository-Deployment-User-Image' src={deployment.creator.avatar_url} alt='User' />
                </figure>
                <i className='Repository-Deployment-More-Icon'>
                    <IoIosMore />
                </i>
                <i 
                    className='Repository-Deployment-Delete-Icon'
                    onClick={() => dispatch(deploymentActions.deleteRepositoryDeployment(repositoryName, deployment.id))}
                >
                    <RiDeleteBin7Line />
                </i>
            </div>
        </div>
    );
};

export default DeploymentItem;