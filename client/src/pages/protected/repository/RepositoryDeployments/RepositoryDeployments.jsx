import React, { useEffect } from 'react';
import { BsCalendarDate } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as deploymentActions from '@services/deployment/actions';
import './RepositoryDeployments.css';

const RepositoryDeployments = () => {
    const dispatch = useDispatch();
    const { repositoryName } = useParams();
    const { deployments } = useSelector(state => state.deployment);

    useEffect(() => {
        dispatch(deploymentActions.getRepositoryDeployments(repositoryName));
    }, []);

    useEffect(() => {
        console.log(deployments);
    }, [deployments]);

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
        <main id='Repository-Deployments-Main'>
            <section id='Repository-Deployments-Header'>
                <h1 id='Repository-Deployments-Header-Title'>Deployments</h1>
                <p id='Repository-Deployments-Header-Subtitle'>Continuously generated from codewithrodi/CodexDrake</p>
            </section>

            <section id='Repository-Deployments-Body'>
                <article id='Repository-Deployments-Body-List'>
                    {deployments.map((deployment, index) => (
                        <div className='Repository-Deployment-Container' key={index}>
                            <div className='Repository-Deployment-Left-Container'>
                                <h3 className='Repository-Deployment-Id'>{deployment.id}</h3>
                                <p className='Repository-Deployment-Environment'>{deployment.environment}</p>
                            </div>

                            <div className='Repository-Deployment-Extras-Container'>
                                <div className='Repository-Deployment-Created-At-Container'>
                                    <i className='Repository-Deployment-Created-At-Icon'>
                                        <BsCalendarDate />
                                    </i>
                                    <span className='Repository-Deployment-Created-At-Name'>{formatDate(deployment.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </article>
            </section>
        </main>
    );
};

export default RepositoryDeployments;