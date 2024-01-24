import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import { useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import useWindowSize from '@hooks/useWindowSize';
import 'xterm/css/xterm.css';
import './Shell.css';

const Shell = () => {
    const terminalRef = useRef(null);
    const fitAddonRef = useRef(null);
    const { width } = useWindowSize();
    const { repositoryName } = useParams();
    const [xterm, setXterm] = useState(null);
    const [socket, setSocket] = useState(null);

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
            query: { repositoryName }
        });
        setSocket(newSocket);
    }, [xterm]);

    useEffect(() => {
        if(!socket || !xterm) return;
        xterm.onData((data) => socket.emit('command', data));
        socket.on('history', (history) => xterm.write(history));
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
            fitAddonRef.current = null;
            term.dispose();
            fitAddon.dispose();
        };
    }, []);

    return (
        <main id='Repository-Shell-Main'>
            <section id='Repository-Shell-Header-Container'>
                <article id='Repository-Shell-Title-Container'>
                    <h1 id='Repository-Shell-Title'>Advanced repository management</h1>
                    <p id='Repository-Shell-Subtitle'>Interact with the root of your repository through the command line. <br /> A connection with the server will be initiated to manage communication.</p>
                </article>
            </section>

            <section id='Repository-Shell-Body-Container'>
                <article id='Repository-Shell'>
                    {(!socket) && (
                        <aside id='Socket-Connection-Loading-Container'>
                            <CircularProgress size='2.5rem' />
                        </aside>
                    )}

                    <div ref={terminalRef} />
                </article>
            </section>
        </main>
    );
};

export default Shell;