import React, { useRef } from 'react';
import Loader from '@components/atoms/Loader';
import ResizableInAxisY from '@components/atoms/ResizableInAxisY';
import { useRemoteTerminal } from '@hooks/ws/';
import { VscGithubAlt } from 'react-icons/vsc';
import { BiBookAlt } from 'react-icons/bi';
import { AiOutlineClose } from 'react-icons/ai';
import { BsTerminal } from 'react-icons/bs';
import { PiDotsSixBold } from 'react-icons/pi';
import { useDispatch } from 'react-redux';
import { setState as coreSetState } from '@services/core/slice';
import './CloudShell.css';

const CloudConsole = () => {
    const termContainerRef = useRef(null);
    const dispatch = useDispatch();
    const { isConnected, fitAddonRef } = useRemoteTerminal({ termContainerRef, query: { action: 'Cloud::Console' } });

    const headerIcons = [
        [VscGithubAlt, () => window.open('https://github.com/rodyherrera/Quantum/')],
        [BiBookAlt, () => window.open('https://github.com/rodyherrera/Quantum/')],
        [AiOutlineClose, () => dispatch(coreSetState({ path: 'isCloudConsoleEnabled', value: false }))]
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
                            <Loader scale='0.7' />
                        </div>
                    )}

                    <div className='Cloud-Shell-Terminal-Container' ref={termContainerRef} />
                </article>
            </aside>
        </ResizableInAxisY>
    );
};

export default CloudConsole;