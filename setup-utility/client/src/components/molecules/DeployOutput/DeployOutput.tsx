import React, { useEffect, useRef } from 'react';
import { addToast } from '@services/toast/slice';
import { useDispatch } from 'react-redux';
import useWebSocket from '@hooks/useWebSocket';
import LoadingScreen from '@components/molecules/LoadingScreen';
import Loader from '@components/atoms/Loader';
import gsap from 'gsap';
import './DeployOutput.css';

const DeployOutput = () => {
    const { isConnected, messages, currentStep } = useWebSocket();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch();

    const scrollToBottom = () => {
        if(containerRef.current){
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if(!messages.length){
            return;
        }

        if(messages.length == 1 && containerRef.current){
            dispatch(addToast({
                id: 'deploying',
                type: 'info',
                message: 'Running @deploy.sh using the provided environment variables. Deploying Quantum in Docker...',
                duration: 5000
            }));

            const isMobile = window.innerWidth <= 768;

            gsap.to('.Setup-Utility-Left-Container', {
              opacity: isMobile ? 1 : 0.5,
              scale: isMobile ? 1 : 0.9,
              duration: 1
            });
        
            gsap.to('.Setup-Utility-Container', {
              opacity: isMobile ? 1 : 0.8,
              scale: isMobile ? 1 : 0.95,
              duration: 1
            });
        
            const rect = containerRef.current.getBoundingClientRect();
            const initialRight = window.innerWidth - rect.right;
        
            const targetWidth = isMobile ? window.innerWidth - 40 : 1000;
            const targetRight = isMobile ? 20 : '2rem';
        
            gsap.fromTo(
                containerRef.current,
                {
                    position: 'absolute',
                    right: initialRight,
                    width: rect.width,
                },
                {
                    right: targetRight,
                    width: targetWidth,
                    height: '90%',
                    top: 0,
                    duration: 1.5,
                    ease: 'power2.out',
                }
            );
        }

        scrollToBottom();
    }, [messages, dispatch]);

    return (
        <React.Fragment>
            <div className='Setup-Utility-Deploy-Steps-Container' data-currentstep={currentStep}>
                {currentStep === 0 && (
                    <div className='Setup-Utility-Deploy-Steps-Not-Yet-Container'>
                        <p className='Setup-Utility-Deploy-Steps-Not-Yet-Description'>You will be able to see the list of steps in which the deployment is from start to finish.</p>
                    </div>
                )}
                {[
                    'Verifying previous deployments...',
                    'Building image and deploying the application...',
                    'Deploying client application...',
                    'Deploying server application...'
                ].map((stepName, index) => (
                    <div className='Setup-Utility-Deploy-Step-Container' key={index}>
                        {(currentStep === (index + 1)) && (
                            <div className='Setup-Utility-Deploy-Step-Loading-Container'>
                                <Loader scale={0.4} />
                            </div>
                        )}
                        <h3 className='Setup-Utility-Deploy-Step'>{stepName}</h3>
                    </div>
                ))}
            </div>

            {!isConnected && (
                <LoadingScreen message='Trying to establish communication with server...' />
            )}
            <div className='Setup-Utility-Deploy-Output' ref={containerRef}>
                {isConnected ? <p>Connected to server</p> : <p>Connecting to server...</p>}
                {messages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
        </React.Fragment>
    );
};

export default DeployOutput;