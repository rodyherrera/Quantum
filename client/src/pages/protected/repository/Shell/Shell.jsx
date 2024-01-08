import React, { useState, useEffect } from 'react';
import { Xterm } from 'xterm-react';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import { useParams } from 'react-router-dom';
import './Shell.css';

const Shell = () => {
    const { repositoryName } = useParams();
    const [socket, setSocket] = useState(null);
    const [terminal, setTerminal] = useState(null);

    useEffect(() => {
        if(!terminal) return;
        terminal.reset();
        const socket = io(import.meta.env.VITE_SERVER, { 
            transports: ['websocket'],
            auth: { token: getCurrentUserToken() },
            query: { repositoryName }
        });
        setSocket(socket);
        socket.on('response', (response) => terminal.write(response));
        return () => {
            socket.close();
            setSocket(null);
        };
    }, [terminal]);

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
                    <Xterm
                        onInit={(term) => setTerminal(term)}
                        onDispose={() => setTerminal(null)}
                        onData={(data) => socket.emit('command', data)}
                    />
                </article>
            </section>
        </main>
    );
};

export default Shell;