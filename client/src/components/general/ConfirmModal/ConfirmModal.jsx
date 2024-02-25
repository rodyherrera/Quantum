/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Input from  '@components/general/Input';
import { IoMdClose } from 'react-icons/io';
import { gsap } from 'gsap';
import { IoIosArrowForward } from 'react-icons/io';
import './ConfirmModal.css';

// TODO: Write this component better.
const ConfirmModal = ({
    highlightTitle,
    title,
    children,
    description,
    warning,
    firstInputRender,
    lastInputRender,
    firstInputMatch,
    lastInputMatch,
    confirmHandler,
    isActive,
    setIsActive
}) => {
    const [firstInputValue, setFirstInputValue] = useState('');
    const [lastInputValue, setLastInputValue] = useState('');
    const [isContinueBtnDisabled, setIsContinueBtnDisabled] = useState(true);
    const confirmModalRef = useRef(null);
    const closeIconRef = useRef(null);
    const confirmButtonRef = useRef(null);

    const hideConfirmModal = (callback) => {
        gsap.to(confirmButtonRef.current, {
            backgroundColor: '#004ad5',
            duration: 0.2,
            ease: 'power2.inOut'
        });
        gsap.fromTo(confirmModalRef.current, { 
            opacity: 1,
            y: 0 
        }, { 
            opacity: 0, 
            y: 50, 
            duration: 0.3, 
            ease: 'power2.in', 
            onComplete: () => {
                if(callback) callback();
                setIsActive(!isActive)
            } 
        });
    };

    const handleContinueBtn = () => {
        hideConfirmModal(confirmHandler);
    };
    
    const closeIconClickHandler = () => {
        gsap.to(closeIconRef.current, {
            rotation: 360,
            duration: 0.5,
            ease: 'back.out',
            onComplete: hideConfirmModal
        });
    };

    useEffect(() => {
        if(!isActive) return;
        gsap.fromTo(confirmModalRef.current, { 
            opacity: 0, 
            y: 50 
        }, { 
            opacity: 1,
            y: 0, 
            duration: 0.4, 
            ease: 'power2.out' 
        });
    }, [isActive]);

    useEffect(() => {
        setIsContinueBtnDisabled(
            firstInputMatch !== firstInputValue ||
            lastInputMatch !== lastInputValue              
        );
    }, [firstInputValue, lastInputValue]);

    useEffect(() => {
        if(!isActive) return;
        const keydownHandler = (e) => {
            if(e.key === 'Enter' && !isContinueBtnDisabled) handleContinueBtn();
            else if(e.key === 'Escape') hideConfirmModal();
        };
        document.addEventListener('keydown', keydownHandler);
        return () => {
            document.removeEventListener('keydown', keydownHandler);
        };
    }, [isActive, isContinueBtnDisabled]);

    useEffect(() => {
        return () => {
            setFirstInputValue('');
            setLastInputValue('');
        };
    }, []);

    return (
        <React.Fragment>
            {isActive && ReactDOM.createPortal(
                <div className='Confirm-Modal-Container' ref={confirmModalRef}>
                    <div className='Confirm-Modal'>
                        <div className='Confirm-Modal-Header-Container'>
                            <div className='Confirm-Modal-Header-Title-Container'>
                                <h3 className='Confirm-Modal-Header-Title'>
                                    <span className='Confirm-Modal-Title-Hightlight'>{highlightTitle}</span> {title}
                                </h3>
                                <i className='Confirm-Modal-Header-Icon-Container' ref={closeIconRef} onClick={closeIconClickHandler}>
                                    <IoMdClose />
                                </i>
                            </div>
                            <p className='Confirm-Modal-Header-Description'>{description}</p>
                            <div className='Confirm-Modal-Warning-Container'>
                                <span className='Confirm-Modal-Warning-Title'>Warning:</span>
                                <span className='Confirm-Modal-Warning-Content'>{warning}</span>
                            </div>
                        </div>

                        <div className='Confirm-Modal-Body-Container'>
                            <div className='Confirm-Modal-Input-Container'>
                                {firstInputRender}
                                <Input
                                    value={firstInputValue}
                                    onChange={(e) => setFirstInputValue(e.target.value)}
                                />
                            </div>

                            <div className='Confirm-Modal-Input-Container'>
                                {lastInputRender}
                                <Input
                                    value={lastInputValue}
                                    onChange={(e) => setLastInputValue(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='Confirm-Modal-Footer-Container'>
                            <button className='Confirm-Modal-Option-Container Text' onClick={hideConfirmModal}>
                                <span className='Confirm-Modal-Option-Title'>Cancel</span>
                            </button>

                            <button 
                                className='Confirm-Modal-Option-Container Contained' 
                                disabled={isContinueBtnDisabled}
                                onClick={handleContinueBtn}
                                ref={confirmButtonRef}
                            >
                                <span className='Confirm-Modal-Option-Title'>Confirm</span>
                                <i className='Confirm-Modal-Option-Icon-Container'>
                                    <IoIosArrowForward />
                                </i>
                            </button>
                        </div>
                    </div>
                </div>
            , document.getElementById('QuantumCloud-ROOT'))}

            {children !== undefined && children}
        </React.Fragment>
    );
};

export default ConfirmModal;