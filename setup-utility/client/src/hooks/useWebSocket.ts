import { useEffect, useRef, useState } from 'react';

const useWebSocket = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        socketRef.current = new WebSocket(import.meta.env.VITE_SERVER + '/ws');
        socketRef.current.onopen = () => {
            setIsConnected(true);
        };
        socketRef.current.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };
        socketRef.current.onclose = () => {
            setIsConnected(false);
        };
        socketRef.current.onerror = (error) => {
            console.error(error);
        };
        return () => {
            if(socketRef.current){
                socketRef.current.close();
            }
        }
    }, []);

    const sendMessage = (message: string) => {
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
            socketRef.current.send(message);
        }
    };

    return { messages, isConnected, sendMessage };
};

export default useWebSocket;