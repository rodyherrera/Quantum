import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDate } from '@utilities/runtime';
import FileExplorer from '@components/repository/FileExplorer';
import AnimatedMain from '@components/general/AnimatedMain';
import './Storage.css';

const Storage = () => {
    const { repositoryName } = useParams();
    const { user } = useSelector((state) => state.auth);
    const { selectedRepository } = useSelector((state) => state.repository);
    const navigate = useNavigate();

    useEffect(() => {
        if(!selectedRepository) 
            return navigate('/dashboard/');
    }, []);

    return selectedRepository && (
        <AnimatedMain id='Repository-Storage-Main'>
            <div className='File-Explorer-Container'>
                <div className='File-Explorer-Header-Container'>
                    <div className='File-Explorer-Header-Left-Container'>
                        <h3 className='File-Explorer-Header-Title'>{user.username}@{repositoryName}</h3>
                    </div>

                    <div className='File-Explorer-Header-Right-Container'>
                        <p className='File-Explorer-Repository-Id'>{selectedRepository._id}</p>
                        <p className='File-Explorer-Created-At'>{formatDate(selectedRepository.createdAt)}</p>
                    </div>
                </div>

                <FileExplorer repositoryId={selectedRepository._id} />
            </div>
        </AnimatedMain>
    );
};

export default Storage;