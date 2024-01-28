import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { BsTerminal } from 'react-icons/bs';
import { PiDotsSixBold } from 'react-icons/pi';
import { VscGithubAlt } from 'react-icons/vsc';
import { BiBookAlt } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import { useDispatch } from 'react-redux';
import { setIsCloudConsoleEnabled } from '@services/core/slice';
import useWindowSize from '@hooks/useWindowSize';
import ResizableInAxisY from '@components/general/ResizableInAxisY';
import './CloudShell.css';

const CloudShell = () => {
    const cloudShellContainerRef = useRef(null);
    const cloudShellHeaderRef = useRef(null);
    const dragIconContainerRef = useRef(null);
    const terminalRef = useRef(null);
    const fitAddonRef = useRef(null);
    const headerRef = useRef(null);
    const dispatch = useDispatch();
    const { width } = useWindowSize();

    useEffect(() => {
        if(!fitAddonRef.current) return;
        fitAddonRef.current.fit();
    }, [width]);

    useEffect(() => {
        const term = new Terminal();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddonRef.current = fitAddon;
        fitAddon.fit();
        const headerEl = document.querySelector('#QuantumCloud-ROOT > .Header');
        headerRef.current = headerEl;
        return () => {
            fitAddonRef.current = null;
            term.dispose();
            fitAddon.dispose();
        };
    }, []);

    return (
        <ResizableInAxisY
            containerRef={cloudShellContainerRef}
            triggerNodeRef={dragIconContainerRef}
            initialHeight={300}
            maxHeight={headerRef}
            minHeight={cloudShellHeaderRef}
            callback={() => {
                if(!terminalRef.current) return;
                fitAddonRef.current.fit();
            }}
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
                        {[
                            [VscGithubAlt, () => {}],
                            [BiBookAlt, () => {}],
                            [AiOutlineClose, () => dispatch(setIsCloudConsoleEnabled(false))]
                        ].map(([ Icon, onClick ], index) => (
                            <i 
                                key={index} 
                                className='Cloud-Shell-Header-Right-Icon-Container' 
                                onClick={onClick}
                            >
                                <Icon />
                            </i>
                        ))}
                    </div>
                </article>

                <article className='Cloud-Shell-Body-Container'>
                    <div ref={terminalRef} />
                </article>
            </aside>
        </ResizableInAxisY>
    );
};

export default CloudShell;