import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '@services/toast/slice';

const CHECK_INTERVAL = 5000;
const RECONNECT_DELAY = 1000;

const useWebSocket = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const dispatch = useDispatch();

    const connect = useCallback(() => {
        let server = import.meta.env.VITE_SERVER || '';

        server = server.replace(/^https?:\/\//, '');

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${server}/ws`;

        console.log('Connecting to WebSocket URL:', wsUrl);

        try{
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('WebSocket connection established.');
                setIsConnected(true);
            };

            socket.onmessage = (event) => {
                setMessages((prev) => [...prev, event.data]);
            };

            socket.onclose = (event) => {
                console.warn('WebSocket connection closed:', event);
                setIsConnected(false);
                setTimeout(() => {
                    connect();
                }, RECONNECT_DELAY);
            };

            socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
                socket.close();
            };
        }catch(err){
            console.error('Failed to create WebSocket connection:', err);
            setTimeout(() => {
                connect();
            }, RECONNECT_DELAY);
        }
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connect]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isConnected) {
                dispatch(addToast({
                    id: `connection-timeout-${Date.now()}`,
                    message: 'Connection timed out. Verify VITE_SERVER in @setup-utility/client/.env',
                    type: 'warning',
                    duration: 5000
                }));
            } else {
                clearInterval(interval);
            }
        }, CHECK_INTERVAL);

        return () => {
            clearInterval(interval);
        };
    }, [isConnected, dispatch]);

    const sendMessage = (message: string) => {
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
            socketRef.current.send(message);
        }else{
            console.warn('WebSocket is not open. Unable to send message:', message);
        }
    };

    return { messages, isConnected, sendMessage };
};

export default useWebSocket;
