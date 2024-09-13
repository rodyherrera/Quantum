import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getCurrentUserToken } from '@services/authentication/localStorageService';

const useWebSocket = ({ query }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const onConnected = () => {
        setIsConnected(true);
    };

    useEffect(() => {
        const authToken = getCurrentUserToken();
        const newSocket = io(import.meta.env.VITE_SERVER, {
            transports: ['websocket'],
            auth: { token: authToken },
            query
        });
        newSocket.on('connected', onConnected);
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        }
    }, []);

    return [socket, isConnected];
};

export default useWebSocket;