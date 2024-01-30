import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FileExplorer from '@components/repository/FileExplorer';
import AnimatedMain from '@components/general/AnimatedMain';
import './Storage.css';

const Storage = () => {
    const { repositoryName } = useParams();
    const { user } = useSelector((state) => state.auth);

    return (
        <AnimatedMain id='Repository-Storage-Main'>
            <div className='File-Explorer-Container'>
                <div className='File-Explorer-Header-Container'>
                    <div className='File-Explorer-Header-Left-Container'>
                        <h3 className='File-Explorer-Header-Title'>{user.username}@{repositoryName}</h3>
                    </div>

                    <div className='File-Explorer-Header-Right-Container'>
                        <p className='File-Explorer-Repository-Id'>62da9b1a31d13c</p>
                        <p className='File-Explorer-Created-At'>2 weeks ago</p>
                    </div>
                </div>

                <FileExplorer />
            </div>
        </AnimatedMain>
    );
};

export default Storage;