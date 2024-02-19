import React, { useRef, useState, useEffect } from 'react';
import { IoIosArrowRoundForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import './RelatedItem.css';

const RelatedItem = ({ Icon, description, title, to }) => {
    const itemRef = useRef(null);
    const [isHover, setIsHover] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if(!itemRef.current) return;
        const mouseEnterHandler = () => {
            setIsHover(true);
        };
        const mouseLeaveHandler = () => {
            setIsHover(false);
        };
        itemRef.current.addEventListener('mouseenter', mouseEnterHandler);
        itemRef.current.addEventListener('mouseleave', mouseLeaveHandler);
    }, [itemRef]);

    return (
        <div className='Related-Item-Container' ref={itemRef} onClick={() => navigate(to)}>
            <div className='Related-Item-Header-Container'>
                <i className='Related-Item-Header-Icon-Container'>
                    <Icon />
                </i>
            </div>
            <div className='Related-Item-Footer-Container'>
                <div className='Related-Item-Footer-Left-Container'>
                    {isHover ? (
                        <p className='Related-Item-Footer-Left-Description'>{description}</p>
                    ) : (
                        <h4 className='Related-Item-Footer-Left-Title'>{title}</h4>
                    )}
                </div>
                <div className='Related-Item-Footer-Right-Container'>
                    <i className='Related-Item-Footer-Right-Icon-Container'>
                        <IoIosArrowRoundForward />
                    </i>
                </div>
            </div>
        </div>
    );
};

export default RelatedItem;