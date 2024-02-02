import React from 'react';
import { BsCalendarDate } from 'react-icons/bs';
import { IoIosMore } from 'react-icons/io';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { formatDate } from '@utilities/runtime';
import * as deploymentActions from '@services/deployment/actions';
import './DeploymentItem.css';

const DeploymentItem = ({ deployment, repositoryAlias }) => {
    const dispatch = useDispatch();

    return (
        <div className='Repository-Deployment-Container'>
            <div className='Repository-Deployment-Left-Container'>
                <div className='Repository-Deployment-Top-Container'>
                    <div className='Repository-Deployment-Created-At-Container'>
                        <i className='Repository-Deployment-Created-At-Icon'>
                                <BsCalendarDate />
                        </i>
                        <span className='Repository-Deployment-Created-At-Name'>{formatDate(deployment.created_at)}</span>
                    </div>
                    <p className='Repository-Deployment-Environment'>{deployment.environment}</p>
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
                    onClick={() => dispatch(deploymentActions.deleteRepositoryDeployment(repositoryAlias, deployment.id))}
                >
                    <RiDeleteBin7Line />
                </i>
            </div>
        </div>
    );
};

export default DeploymentItem;