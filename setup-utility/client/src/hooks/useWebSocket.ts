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
        const socket = new WebSocket(`${import.meta.env.VITE_SERVER}/ws`);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        socket.onclose = () => {
            setIsConnected(false);
            setTimeout(() => {
                connect();
            }, RECONNECT_DELAY);
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            socket.close();
        };
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if(socketRef.current){
                socketRef.current.close();
            }
        };
    }, [connect]);

    useEffect(() => {
        const interval = setInterval(() => {
            if(!isConnected){
                dispatch(addToast({
                    id: `connection-timeout-${Date.now()}`,
                    message: 'The connection to the server has not yet been established.',
                    type: 'warning',
                    duration: 5000
                }));
            }else{
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
        }
    };

    return { messages, isConnected, sendMessage };
};

export default useWebSocket;