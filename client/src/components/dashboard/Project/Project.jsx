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

import React, { useRef, useEffect } from 'react';
import ProjectHeader from '@components/dashboard/ProjectHeader';
import ProjectActions from '@components/dashboard/ProjectActions';
import ProjectFooter from '@components/dashboard/ProjectFooter';
import { gsap } from 'gsap';
import './Project.css';

const Project = ({ repository, ...props }) => {
    const projectRef= useRef(null);

    const onClickHandler = (e) => {
        if(
            e.target.classList.contains('Context-Menu-Container') || 
            e.target.classList.contains('Context-Menu-Option')
        ){
            return;
        }
        props?.onClick?.();
    };
    useEffect(() => {
        const projectContainers = document.querySelectorAll('.Project-Container');
        projectContainers.forEach((container, index) => {
            gsap.fromTo(container, { 
                opacity: 0,
                duration: 0.3,
            }, {
                opacity: 1,
                delay: index * 0.05, 
                ease: 'power2.out',
            });
        });

        const body = projectRef.current.querySelector('.Project-Body-Container');
        const footer = projectRef.current.querySelector('.Project-Footer-Container');
        gsap.fromTo([body, footer], {
            y: 20,
            opacity: 0
        }, {
            duration: 0.4,
            stagger: 0.15,
            y: 0,
            opacity: 1
        });
    }, []); 

    return (
        <div className='Project-Container' {...props} onClick={onClickHandler} ref={projectRef}>
            <ProjectActions repository={repository} />
            <ProjectHeader repository={repository} />
            <div className='Project-Body-Container'>
                <div className='Project-Description-Container'>
                    <p className='Project-Description'>{repository.latestCommitMessage}</p>
                </div>
            </div>
            <ProjectFooter repository={repository} />
        </div>
    );
};

export default Project;