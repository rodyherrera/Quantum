import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LuGithub } from "react-icons/lu";
import { BsTerminalPlus } from "react-icons/bs";
import { TbServerBolt } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { setState as coreSetState } from '@services/core/slice';
import './UserStickyFooterStats.css';

const UserStickyFooterStats = () => {
    const { user } = useSelector((state) => state.auth);
    const { isCloudConsoleEnabled } = useSelector(state => state.core);
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const mainRef = document.querySelector('main');
        let lastScrollY = mainRef ? mainRef.scrollTop : 0;
        let isAnimating = false;
        let inactivityTimeout = null;

        const handleScroll = () => {
            if(isAnimating) return;
            clearTimeout(inactivityTimeout);
            isAnimating = true;
            const currentScrollY = mainRef ? mainRef.scrollTop : 0;
            requestAnimationFrame(() => {
                if(currentScrollY > lastScrollY){
                    // scroll down
                    gsap.to(containerRef.current, {
                        y: '100%', 
                        duration: 0.5, 
                        onComplete: () => isAnimating = false 
                    });
                }else{
                    // scroll up
                    gsap.to(containerRef.current, {
                        y: '0%', 
                        duration: 0.5, 
                        onComplete: () => isAnimating = false 
                    });
                }
                lastScrollY = currentScrollY;
                inactivityTimeout = setTimeout(() => {
                    gsap.to(containerRef.current, {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        ease: 'power3.out'
                    });
                }, 1000);
            });
        };

        mainRef.addEventListener('scroll', handleScroll);

        return () => {
            mainRef.removeEventListener('scroll', handleScroll);
            clearTimeout(inactivityTimeout);
        }
    }, []);

    return (
        <div ref={containerRef} className='User-Sticky-Footer-Stats-Container'>
            <div className='User-Sticky-Footer-Stats-Group'>
                {[
                    `${user.images.length} image(s)`,
                    `${user.networks.length} network(s)`,
                    `${user.portBindings.length} port(s)`,
                    `${user.repositories.length} repository(ies)`,
                    `${user.deployments.length} deployment(s)`
                ].map((item, index) => (
                    <div className='User-Sticky-Footer-Stats-Item' key={index}>
                        <p className='User-Sticky-Footer-Stats-Item-Content'>{item}</p>
                    </div>
                ))}
            </div>

            <div className='User-Sticky-Footer-Stats-Item'>
                <div className='User-Sticky-Footer-Stats-Group'>
                    <div className='User-Sticky-Footer-Stats-Item'>
                        <p className='User-Sticky-Footer-Stats-Item-Content'>{user.containers.length} container(s)</p>
                    </div>
                    <div className='User-Sticky-Footer-Stats-Item'>
                        <p className='User-Sticky-Footer-Stats-Item-Content'>{user.containers.filter(c => c.status === 'running').length} running</p>
                    </div>
                    <div className='User-Sticky-Footer-Stats-Item'>
                        <p className='User-Sticky-Footer-Stats-Item-Content'>{user.containers.filter(c => c.status === 'stopped').length} stopped</p>
                    </div>
                    <div className='User-Sticky-Footer-Stats-Item'>
                        <p className='User-Sticky-Footer-Stats-Item-Content'>{user.containers.filter(c => c.status === 'restarting').length} restarting</p>
                    </div>
                </div>
            </div>

            <div className='User-Sticky-Footer-Stats-Item' onClick={() => navigate('/docker-container/create/')}>
                <p className='User-Sticky-Footer-Stats-Item-Content Hover-Underline'>+ Create Container</p>
                <i className='User-Sticky-Footer-Stats-Item-Icon'><TbServerBolt /></i>
            </div>

            <div className='User-Sticky-Footer-Stats-Item' onClick={() => navigate('/repository/create/')}>
                <p className='User-Sticky-Footer-Stats-Item-Content Hover-Underline'>+ Deploy Repository</p>
                <i className='User-Sticky-Footer-Stats-Item-Icon'><LuGithub /></i>
            </div>

            <div
                className='User-Sticky-Footer-Stats-Item'
                onClick={() => dispatch(coreSetState({ path: 'isCloudConsoleEnabled', value: !isCloudConsoleEnabled }))}
            >
                <p className='User-Sticky-Footer-Stats-Item-Content Hover-Underline'>+ Cloud Console</p>
                <i className='User-Sticky-Footer-Stats-Item-Icon'><BsTerminalPlus /></i>
            </div>
        </div>
    );
};

export default UserStickyFooterStats;
