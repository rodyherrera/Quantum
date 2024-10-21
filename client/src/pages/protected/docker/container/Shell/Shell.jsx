import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useRemoteTerminal } from '@hooks/ws/';
import { useWindowSize } from '@hooks/common/';
import { useSelector } from 'react-redux';
import DockerContainerTerminalImage from '@images/DockerContainerTerminal.webp';
import AnimatedMain from '@components/atoms/AnimatedMain';
import './Shell.css';

const Shell = () => {
    const termContainerRef = useRef(null);
    const { width } = useWindowSize();
    const { dockerId } = useParams();
    const { selectedDockerContainer } = useSelector((state) => state.dockerContainer);
    const { isConnected, fitAddonRef } = useRemoteTerminal({
        termContainerRef, query: { dockerId, action: 'DockerContainer::Shell' } });
        
    useEffect(() => {
        if(!fitAddonRef.current) return;
        fitAddonRef.current.fit();
        console.log(selectedDockerContainer)
    }, [width]);

    return (
        <AnimatedMain id='Docker-Container-Terminal-Main'>
            {!isConnected && (
                <section className='Docker-Container-Terminal-Loading-Container'>
                    <CircularProgress className='Circular-Progress' />
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
                <article className='Docker-Terminal-Image-Container'>
                    <img className='Docker-Terminal-Image' src={DockerContainerTerminalImage} />
                </article> 
            </section>
        </AnimatedMain>
    );

    /*
    return (
        <AnimatedMain>
            


            {!isConnected && (
                <CircularProgress className='Circular-Progress' />
            )}
            <img src={DockerContainerTerminalImage} />
            <div className='Docker-Terminal-Container' ref={termContainerRef} />
        </AnimatedMain>
    );*/
};

export default Shell;