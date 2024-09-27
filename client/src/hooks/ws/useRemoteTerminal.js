import { useWebSocket } from '@hooks/ws/';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';

const useRemoteTerminal = ({ termContainerRef, query }) => {
    const [socket, isConnected] = useWebSocket({ query });
    const xtermRef = useRef(null);
    const termInputValueRef = useRef('');
    const fitAddonRef = useRef(null);

    // This function will be used to handle the 'history' event that sends past 
    // interactions of the user with the terminal (log) and the 'response' event 
    // that server sends the response to commands that are sent.
    const onResponse = (data) => {
        xtermRef.current.write(data);
    }

    const onKey = ({ domEvent, key }) => {
        const { keyCode } = domEvent;
        if(keyCode === 13){
            socket.emit('command', termInputValueRef.current.trim());
            termInputValueRef.current = '';
            xtermRef.current.write('\r\n');
        }else if(keyCode === 8){
            // Backspace 
            if(!termInputValueRef.current.length) return;
            termInputValueRef.current = termInputValueRef.current.slice(0, -1);
            xtermRef.current.write('\b \b');
        }else{
            // If this block is executed, it is assumed that the 
            // user is typing in the terminal. Therefore, we write about it.
            if(key.length === 1){
                termInputValueRef.current += key;
                xtermRef.current.write(key);
            }
        }
    }

    const createTerm = () => {
        xtermRef.current = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontFamily: 'monospace',
            fontSize: (window.innerWidth > 768 ? 14 : 8),
            cols: 128,
            cursorStyle: 'bar',
            theme: {
                foreground: '#ffffff',
                background: '#000000'
            }
        });
        fitAddonRef.current = new FitAddon();
        xtermRef.current.loadAddon(fitAddonRef.current);
        xtermRef.current.open(termContainerRef.current);
        xtermRef.current.onKey(onKey);
        fitAddonRef.current.fit();
    }

    useEffect(() => {
        if(isConnected){
            createTerm();
            socket.on('response', onResponse);
            socket.on('history', onResponse);
            return () => {
                socket.off('response', onResponse);
                socket.off('history', onResponse);
                xtermRef.current.dispose();
            }
        }
    }, [isConnected]);

    return { isConnected, fitAddonRef, xtermRef };
};

export default useRemoteTerminal;