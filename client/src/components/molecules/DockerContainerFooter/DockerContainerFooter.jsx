import React from 'react';
import { IoCloudOutline } from 'react-icons/io5';
import { CiServer } from 'react-icons/ci';
import { PiDatabaseThin } from 'react-icons/pi';
import './DockerContainerFooter.css';

const DockerContainerFooter = ({ container }) => {

    return (
        <div className='Docker-Container-Footer'>
            <div className='Docker-Container-Footer-Left-Container'>
                {[
                    ['Expose Port', IoCloudOutline],
                    ['Environment Variables', PiDatabaseThin],
                    ['File Explorer', CiServer]
                ].map(([ item, Icon ], index) => (
                    <div className='Docker-Container-Footer-Option-Container' key={index}>
                        <i className='Docker-Container-Footer-Option-Icon-Container'>
                            <Icon />
                        </i>
                        <p className='Docker-Container-Footer-Option-Title'>{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DockerContainerFooter;