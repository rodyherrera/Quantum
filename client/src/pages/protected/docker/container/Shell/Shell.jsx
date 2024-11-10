import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRemoteTerminal } from '@hooks/ws/';
import { useWindowSize } from '@hooks/common/';
import { useSelector } from 'react-redux';
import Loader from '@components/atoms/Loader';
import AnimatedMain from '@components/atoms/AnimatedMain';
import './Shell.css';

const Shell = () => {
    const termContainerRef = useRef(null);
    const navigate = useNavigate();
    const { width } = useWindowSize();
    const { dockerId } = useParams();
    const { selectedDockerContainer } = useSelector((state) => state.dockerContainer);
    const { isConnected, fitAddonRef } = useRemoteTerminal({
        termContainerRef, query: { dockerId, action: 'DockerContainer::Shell' } });
        
    useEffect(() => {
        console.log(selectedDockerContainer)
        if(!selectedDockerContainer?._id) navigate('/dashboard/');
    }, []);

    useEffect(() => {
        if(!fitAddonRef.current) return;
        fitAddonRef.current.fit();
    }, [width]);

    return selectedDockerContainer._id && (
        <AnimatedMain id='Docker-Container-Terminal-Main'>
            {!isConnected && (
                <section className='Docker-Container-Terminal-Loading-Container'>
                    <Loader scale='0.7' />
                    <p className='Docker-Container-Terminal-Loading-Message'>Connecting to your container...</p>
                </section>
            )}
            <section className='Docker-Container-Terminal' data-isconnected={isConnected}>
                <article className='Docker-Container-Terminal-Wrapper'>
                    <div
                        className='Docker-Terminal-Container' 
                        ref={termContainerRef} />
                    <div className='Docker-Container-Info'>
                        <p className='Docker-Container-Nerd-Info'>{selectedDockerContainer.name}/{selectedDockerContainer.image.name}:{selectedDockerContainer.image.tag} ({selectedDockerContainer.ipAddress} - {selectedDockerContainer.network.name})</p>
                    </div>
                </article>
            </section>
        </AnimatedMain>
    );
};

export default Shell;