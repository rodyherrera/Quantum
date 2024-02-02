import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { BsTerminal } from 'react-icons/bs';
import { PiDotsSixBold } from 'react-icons/pi';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import { VscGithubAlt } from 'react-icons/vsc';
import { BiBookAlt } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import { CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { setIsCloudConsoleEnabled } from '@services/core/slice';
import useWindowSize from '@hooks/useWindowSize';
import ResizableInAxisY from '@components/general/ResizableInAxisY';
import './CloudShell.css';

const CloudShell = () => {
    const cloudShellContainerRef = useRef(null);
    const cloudShellHeaderRef = useRef(null);
    const dragIconContainerRef = useRef(null);
    const terminalRef = useRef(null);
    const fitAddonRef = useRef(null);
    const headerRef = useRef(null);
    const dispatch = useDispatch();
    const { width } = useWindowSize();
    const [xterm, setXterm] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const headerIcons = [
        [VscGithubAlt, () => window.open('https://github.com/rodyherrera/Quantum/')],
        [BiBookAlt, () => window.open('https://github.com/rodyherrera/Quantum/')],
        [AiOutlineClose, () => dispatch(setIsCloudConsoleEnabled(false))]
    ];

    useEffect(() => {
        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddonRef.current = fitAddon;
        fitAddon.fit();
        setXterm(term);
        const headerEl = document.querySelector('#QuantumCloud-ROOT > .Header');
        headerRef.current = headerEl;
        return () => {
            setSocket(null);
            setXterm(null);
            setIsLoading(true);
            fitAddonRef.current = null;
            term.dispose();
            fitAddon.dispose();
        };
    }, []);

    useEffect(() => {
        if(!xterm) return;
        const authToken = getCurrentUserToken();
        const newSocket = io(import.meta.env.VITE_SERVER, {
            transports: ['websocket'],
            auth: { token: authToken },
            query: { action: 'Cloud::Console' }
        });
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [xterm]);

    useEffect(() => {
        if(!socket || !xterm) return;
        xterm.onData((data) => socket.emit('command', data));
        socket.on('history', (history) => {
            setIsLoading(false);
            xterm.write(history);
        });
        socket.on('response', (response) => xterm.write(response));
    }, [socket, xterm]);

    useEffect(() => {
        if(fitAddonRef.current){
            fitAddonRef.current.fit();
        }
    }, [width]);

    return (
        <ResizableInAxisY
            containerRef={cloudShellContainerRef}
            triggerNodeRef={dragIconContainerRef}
            initialHeight={300}
            maxHeight={headerRef}
            minHeight={cloudShellHeaderRef}
            callback={() => {
                fitAddonRef.current.fit();
            }}
        >
            <aside className='Cloud-Shell-Container' ref={cloudShellContainerRef}>
                <article className='Cloud-Shell-Header-Container' ref={cloudShellHeaderRef}>
                    <div className='Cloud-Shell-Header-Left-Container'>
                        <i className='Cloud-Shell-Header-Left-Icon-Container'>
                            <BsTerminal />
                        </i>
                        <div className='Cloud-Shell-Header-Left-Title-Container'>
                            <h3 className='Cloud-Shell-Header-Left-Title'>Server Management</h3>
                            <p className='Cloud-Shell-Header-Left-Subtitle'>Quantum Cloud Console</p>
                        </div>
                    </div>

                    <div className='Cloud-Shell-Header-Center-Container'>
                        <i className='Cloud-Shell-Drag-Icon-Container' ref={dragIconContainerRef}>
                            <PiDotsSixBold />
                        </i>
                    </div>

                    <div className='Cloud-Shell-Header-Right-Container'>
                        {headerIcons.map(([ Icon, onClick ], index) => (
                            <i key={index} className='Cloud-Shell-Header-Right-Icon-Container' onClick={onClick}>
                                <Icon />
                            </i>
                        ))}
                    </div>
                </article>

                <article className='Cloud-Shell-Body-Container'>
                    {isLoading && (
                        <div className='Cloud-Shell-Loading-Container'>
                            <CircularProgress className='Circular-Progress' />
                        </div>
                    )}

                    <div ref={terminalRef} />
                </article>
            </aside>
        </ResizableInAxisY>
    );
};

export default CloudShell;