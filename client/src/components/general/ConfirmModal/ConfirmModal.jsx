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
import ConfirmModalHeader from '@components/general/ConfirmModalHeader';
import ConfirmModalBody from '@components/general/ConfirmModalBody';
import ConfirmModalFooter from '@components/general/ConfirmModalFooter';
import { gsap } from 'gsap';
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
    const [isContinueBtnDisabled, setIsContinueBtnDisabled] = useState(true);
    const confirmModalRef = useRef(null);
    const confirmButtonRef = useRef(null);

    const hideConfirmModal = (callback = null) => {
        window.scrollTo({ behavior: 'smooth', top: 0 });
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
                setIsActive(!isActive);
            } 
        });
    };

    const handleContinueBtn = () => {
        hideConfirmModal(confirmHandler);
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

    return (
        <React.Fragment>
            {isActive && ReactDOM.createPortal(
                <div className='Confirm-Modal-Container' ref={confirmModalRef}>
                    <div className='Confirm-Modal'>
                        <ConfirmModalHeader 
                            hideConfirmModal={hideConfirmModal}
                            title={title}
                            highlightTitle={highlightTitle} 
                            description={description} 
                            warning={warning} />

                        <ConfirmModalBody
                            firstInputRender={firstInputRender}
                            lastInputRender={lastInputRender}
                            firstInputMatch={firstInputMatch} 
                            lastInputMatch={lastInputMatch}
                            setIsContinueBtnDisabled={setIsContinueBtnDisabled} />

                        <ConfirmModalFooter
                            hideConfirmModal={hideConfirmModal}
                            isContinueBtnDisabled={isContinueBtnDisabled}
                            handleContinueBtn={handleContinueBtn}
                            confirmButtonRef={confirmButtonRef} />
                    </div>
                </div>
            , document.getElementById('QuantumCloud-ROOT'))}

            {children !== undefined && children}
        </React.Fragment>
    );
};

export default ConfirmModal;