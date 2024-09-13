import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import useWebSocket from '@hooks/useWebSocket';
import ResizableInAxisY from '@components/general/ResizableInAxisY';
import './CloudShell.css';


import { VscGithubAlt } from 'react-icons/vsc';
import { BiBookAlt } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import { CircularProgress } from '@mui/material';
import { BsTerminal } from 'react-icons/bs';
import { PiDotsSixBold } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { setIsCloudConsoleEnabled } from '@services/core/slice';


const CloudConsole = () => {
    const [socket, isConnected] = useWebSocket('Cloud::Console');
    const termInputValueRef = useRef('');
    const xtermRef = useRef(null);
    const termContainerRef = useRef(null);
    const fitAddonRef = useRef(null);


    const dispatch = useDispatch();


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
    };

    const createTerm = () => {
        xtermRef.current = new Terminal({
            cursorBlink: true,
            convertEol: true,
            fontFamily: 'monospace',
            fontSize: 14,
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



    const headerIcons = [
        [VscGithubAlt, () => window.open('https://github.com/rodyherrera/Quantum/')],
        [BiBookAlt, () => window.open('https://github.com/rodyherrera/Quantum/')],
        [AiOutlineClose, () => dispatch(setIsCloudConsoleEnabled(false))]
    ];

    const cloudShellHeaderRef = useRef(null);
    const dragIconContainerRef = useRef(null);
    const cloudShellContainerRef = useRef(null);
    const headerRef = useRef(null);

    return (
        <ResizableInAxisY
            containerRef={cloudShellContainerRef}
            triggerNodeRef={dragIconContainerRef}
            initialHeight={300}
            maxHeight={headerRef}
            callback={() => {
                fitAddonRef.current.fit();
            }}
            minHeight={cloudShellHeaderRef}
        >
            <aside className='Cloud-Shell-Container' ref={cloudShellContainerRef}>
                <article className='Cloud-Shell-Header-Container' ref={cloudShellHeaderRef}>
                    <div className='Cloud-Shell-Header-Left-Container'>
                        <i className='Cloud-Shell-Header-Left-Icon-Container'>
                            <BsTerminal />
                        </i>
                        <div className='Cloud-Shell-Header-Left-Title-Container'>
                            <h3 className='Cloud-Shell-Header-Left-Title'>Server Management</h3>
                            <p className='Cloud-Shell-Header-Left-Subtitle'>Quantum Cloud Console</p>
                        </div>
                    </div>

                    <div className='Cloud-Shell-Header-Center-Container'>
                        <i className='Cloud-Shell-Drag-Icon-Container' ref={dragIconContainerRef}>
                            <PiDotsSixBold />
                        </i>
                    </div>

                    <div className='Cloud-Shell-Header-Right-Container'>
                        {headerIcons.map(([ Icon, onClick ], index) => (
                            <i key={index} className='Cloud-Shell-Header-Right-Icon-Container' onClick={onClick}>
                                <Icon />
                            </i>
                        ))}
                    </div>
                </article>

                <article className='Cloud-Shell-Body-Container'>
                    {!isConnected && (
                        <div className='Cloud-Shell-Loading-Container'>
                            <CircularProgress className='Circular-Progress' />
                        </div>
                    )}

                    <div className='Cloud-Shell-Terminal-Container' ref={termContainerRef} />
                </article>
            </aside>
        </ResizableInAxisY>
    );
};

export default CloudConsole;