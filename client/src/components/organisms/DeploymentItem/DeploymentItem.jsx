/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import React from 'react';
import { BsCalendarDate } from 'react-icons/bs';
import { IoIosMore } from 'react-icons/io';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { formatDate } from '@utilities/common/dateUtils';
import * as deploymentOperations from '@services/deployment/operations';
import './DeploymentItem.css';

const DeploymentItem = ({ deployment, repository }) => {
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
                    onClick={() => dispatch(deploymentOperations.deleteRepositoryDeployment(repository.name, deployment.id))}
                >
                    <RiDeleteBin7Line />
                </i>
            </div>
        </div>
    );
};

export default DeploymentItem;