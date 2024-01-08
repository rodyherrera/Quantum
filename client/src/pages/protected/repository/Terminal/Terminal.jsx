import React, { useState, useEffect } from 'react';
import { Xterm } from 'xterm-react';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import { useParams } from 'react-router-dom';
import './Terminal.css';

const TerminalPage = () => {
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
        <main id='Repository-Terminal-Main'>
            <section id='Repository-Terminal-Header-Container'>
                <article id='Repository-Terminal-Title-Container'>
                    <h1 id='Repository-Terminal-Title'>Advanced repository management</h1>
                    <p id='Repository-Terminal-Subtitle'>Interact with the root of your repository through the command line. <br /> A connection with the server will be initiated to manage communication.</p>
                </article>
            </section>

            <section id='Repository-Terminal-Body-Container'>
                <article id='Repository-Terminal'>
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

export default TerminalPage;