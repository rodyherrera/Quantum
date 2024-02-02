import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import { useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import AnimatedMain from '@components/general/AnimatedMain'
import Breadcrumbs from '@components/general/Breadcrumbs';
import useWindowSize from '@hooks/useWindowSize';
import 'xterm/css/xterm.css';
import './Shell.css';

const Shell = () => {
    const terminalRef = useRef(null);
    const fitAddonRef = useRef(null);
    const { width } = useWindowSize();
    const { repositoryAlias } = useParams();
    const [xterm, setXterm] = useState(null);
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(!fitAddonRef.current) return;
        fitAddonRef.current.fit();
    }, [width]);

    useEffect(() => {
        if(!xterm) return;
        const authToken = getCurrentUserToken();
        const newSocket = io(import.meta.env.VITE_SERVER, {
            transports: ['websocket'],
            auth: { token: authToken },
            query: { repositoryAlias, action: 'Repository::Shell' }
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
            xterm.write(history)
        });
        socket.on('response', (response) => xterm.write(response));
    }, [socket, xterm]);

    useEffect(() => {
        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddonRef.current = fitAddon;
        fitAddon.fit();
        setXterm(term);

        return () => {
            setSocket(null);
            setXterm(null);
            setIsLoading(true);
            fitAddonRef.current = null;
            term.dispose();
            fitAddon.dispose();
        };
    }, []);

    return (
        <AnimatedMain id='Repository-Shell-Main'>
            <section id='Repository-Shell-Header-Container'>
                <Breadcrumbs
                    items={[
                        { title: 'Dashboard', to: '/dashboard/' },
                        { title: 'Repositories', to: '/dashboard/' },
                        { title: repositoryAlias, to: '/dashboard/' },
                        { title: 'Shell', to: `/repository/${repositoryAlias}/shell/` }
                    ]}
                />
                <article id='Repository-Shell-Title-Container'>
                    <h1 id='Repository-Shell-Title'>Advanced repository management</h1>
                    <p id='Repository-Shell-Subtitle'>Interact with the root of your repository through the command line. <br /> A connection with the server will be initiated to manage communication.</p>
                </article>
            </section>

            <section id='Repository-Shell-Body-Container'>
                <article id='Repository-Shell'>
                    {(isLoading) && (
                        <aside id='Socket-Connection-Loading-Container'>
                            <CircularProgress className='Circular-Progress' />
                        </aside>
                    )}

                    <div ref={terminalRef} />
                </article>
            </section>
        </AnimatedMain>
    );
};

export default Shell;