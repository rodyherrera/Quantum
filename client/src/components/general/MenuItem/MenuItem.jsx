import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { setIsMenuEnabled } from '@services/core/slice';
import './MenuItem.css';

const MenuItem = ({ icon, title, to }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const clickHandler = (link) => {
        if(link.startsWith('http')) window.open(link, '_blank')
        else navigate(link);
        dispatch(setIsMenuEnabled(false));
    };

    return (
        <li className='Menu-Item-Container' onClick={() => clickHandler(to)}>
            <div className='Menu-Item-Left-Container'>
                <i className='Menu-Item-Icon-Container'>
                    {icon}
                </i>
                <h3 className='Menu-Item-Title'>{title}</h3>
            </div>

            <div className='Menu-Item-Right-Container'>
                <i className='Menu-Item-Arrow-Icon-Container'>
                    <FaLongArrowAltRight />
                </i>
            </div>
        </li>
    );
};

export default MenuItem;