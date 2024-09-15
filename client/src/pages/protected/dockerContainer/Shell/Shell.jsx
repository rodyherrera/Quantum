import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import useRemoteTerminal from '@hooks/useRemoteTerminal';
import useWindowSize from '@hooks/useWindowSize';
import AnimatedMain from '@components/atoms/AnimatedMain';
import './Shell.css';

const Shell = () => {
    const termContainerRef = useRef(null);
    const { width } = useWindowSize();
    const { dockerId } = useParams();
    const { isConnected, fitAddonRef } = useRemoteTerminal({
        termContainerRef, query: { dockerId, action: 'DockerContainer::Shell' } });
    
    useEffect(() => {
        if(!fitAddonRef.current) return;
        fitAddonRef.current.fit();
    }, [width]);

    return (
        <AnimatedMain>
            {!isConnected && (
                <CircularProgress className='Circular-Progress' />
            )}
            <div className='Docker-Terminal-Container' ref={termContainerRef} />
        </AnimatedMain>
    );
};

export default Shell;