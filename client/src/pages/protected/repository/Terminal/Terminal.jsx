import React, { useState, useEffect } from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import { useParams } from 'react-router-dom';
import './Terminal.css';

const TerminalPage = () => {
    const { repositoryName } = useParams();
    const { user } = useSelector(state => state.auth);
    const [socket, setSocket] = useState(null);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalOutput, setTerminalOutput] = useState([
        <TerminalOutput>Connecting to server...</TerminalOutput>
    ]);

    const handleTerminalInput = (input) => {
        setTerminalInput(input);
        setTerminalOutput([
            ...terminalOutput,
            <TerminalOutput>$: {input}</TerminalOutput>
        ]);
    };

    const handleCommandResponse = (response) => {
        setTerminalOutput([
            ...terminalOutput,
            <TerminalOutput>{response}</TerminalOutput>
        ]);
    };

    useEffect(() => {
        if(!socket) return;
        if(terminalInput === 'clear'){
            setTerminalOutput([]);
            return;
        }
        socket.emit('command', terminalInput, handleCommandResponse);
    }, [terminalInput]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SERVER, { 
            transports: ['websocket'],
            auth: { token: getCurrentUserToken() },
            query: { repositoryName }
        });
        setSocket(socket);
        socket.on('connect', () => {
            setTerminalOutput([
                ...terminalOutput,
                <TerminalOutput>Connection established.</TerminalOutput>
            ]);
        });
        return () => {
            socket.close();
        };
    }, []);

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
                    <Terminal 
                        name={repositoryName} 
                        colorMode={ColorMode.Dark}
                        onInput={handleTerminalInput}
                        prompt={`${user.username}@${repositoryName}:~$`}
                    >
                        {terminalOutput}
                    </Terminal>
                </article>
            </section>
        </main>
    );
};

export default TerminalPage;