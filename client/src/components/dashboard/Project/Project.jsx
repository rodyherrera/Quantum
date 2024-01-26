import React from 'react';
import { IoIosMore } from 'react-icons/io';
import { FaGithub } from 'react-icons/fa';
import { IoIosGitBranch } from 'react-icons/io';
import { formatDate } from '@utilities/runtime';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ContextMenu from '@components/general/ContextMenu';
import * as repositoryActions from '@services/repository/actions';
import * as deploymentActions from '@services/deployment/actions';
import './Project.css';

const Project = ({ repository, ...props }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { repositories } = useSelector(state => state.repository);

    return (
        <div 
            className='Project-Container' 
            {...props}
            onClick={(e) => {
                if(e.target.className.includes('Context-Menu-Container') || e.target.className.includes('Context-Menu-Option')) 
                    return;
                props.onClick();
            }}
        >
            <ContextMenu 
                className='Project-More-Icon-Container' 
                options={[
                    { title: 'Start', onClick: () => dispatch(deploymentActions.repositoryActions(repository.name, { action: 'start' })) },
                    { title: 'Restart', onClick: () => dispatch(deploymentActions.repositoryActions(repository.name, { action: 'restart' })) },
                    { title: 'Stop', onClick: () => dispatch(deploymentActions.repositoryActions(repository.name, { action: 'stop' })) },
                    { title: 'Delete', onClick: () => dispatch(repositoryActions.deleteRepository(repository._id, repositories, navigate)) },
                    { title: 'Build & Dev Settings',  onClick: () => navigate(`/repository/${repository.name}/deployment/setup/`, { state: { repository } }) },
                    { title: 'Environment Variables',  onClick: () => navigate(`/repository/${repository.name}/deployment/environment-variables/`, { state: { repository } }) },
                    { title: 'Deployments', onClick: () => navigate(`/repository/${repository.name}/deployments/`) },
                    { title: 'Shell', onClick: () => navigate(`/repository/${repository.name}/shell/`) }
                ]}
            >
                <i>
                    <IoIosMore />
                </i>
            </ContextMenu>

            <div className='Project-Header-Container'>
                <div className='Project-Image-Container'>
                    <img className='Project-Image' src='https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png' alt='Project' />
                </div>
                <div className='Project-Title-Container'>
                    <h3 className='Project-Title'>{repository.name}</h3>
                    <p className='Project-URL'>{repository.website || 'Website not defined.'}</p>
                </div>
            </div>

            <div className='Project-Body-Container'>
                <div className='Project-Description-Container'>
                    <p className='Project-Description'>{repository.latestCommitMessage}</p>
                </div>
            </div>

            <div className='Project-Footer-Container'>
                <p className='Project-Update-Message'>
                    <i className='Project-Github-Icon-Container'>
                        <FaGithub />
                    </i>
                    <span>{formatDate(repository.latestCommit)} on</span>
                    <i className='Project-Github-Icon-Container'>
                        <IoIosGitBranch />
                    </i>
                    <span>{repository.branch}</span>
                </p>
            </div>
        </div>
    );
};

export default Project;