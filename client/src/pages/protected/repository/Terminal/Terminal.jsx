import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';
import './Terminal.css';

const Terminal = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SERVER, { 
            transports: ['websocket'],
            auth: { token: getCurrentUserToken() }
        });
        setSocket(socket);
        return () => socket.close();
    }, []);

    return (
        <main id='Repository-Terminal-Main'>
            <h1>Terminal</h1>
        </main>
    );
};

export default Terminal;