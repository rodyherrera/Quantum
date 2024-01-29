import React from 'react';
import { BiHomeAlt2 } from 'react-icons/bi';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { BsBook, BsTerminal } from 'react-icons/bs';
import { CiServer } from 'react-icons/ci';
import { RxReader } from 'react-icons/rx';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { GoProjectSymlink } from 'react-icons/go';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setIsMenuEnabled } from '@services/core/slice';
import Button from '@components/general/Button';
import Header from '@components/general/Header';
import Banner from '@components/general/Banner';
import './Menu.css';

const Menu = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const clickHandler = (link) => {
        if(link.startsWith('http')) window.open(link, '_blank')
        else navigate(link);
        dispatch(setIsMenuEnabled(false));
    };

    return (
        <aside className='Menu-Container'>
            <article className='Menu-Header-Container'>
                <Banner text='We streamline and automate your deployments 🔥' />
                <Header />

                <div className='Menu-Header-Actions-Container'>
                    <Button
                        variant='Contained Black Small Extended-Sides'
                        title='Github Repository' />
                    <Button
                        variant='Small Extended-Sides'
                        title='Donate' />
                </div>
            </article>

            <ul className='Menu-Items-Container'>
                {[
                    ['Home', <BiHomeAlt2 />, '/'],
                    ['Deployments', <MdOutlineSpaceDashboard />, '/dashboard/'],
                    ['Create Deployment', <GoProjectSymlink />, '/repository/create/'],
                    ['Service Status', <CiServer />, '/service-status/'],
                    ['Privacy Policy', <RxReader />, '/legal/privacy-policy/'],
                    ['Documentation', <BsBook />, 'https://github.com/rodyherrera/Quantum/']
                ].map(([ title, icon, to ], index) => (
                    <li className='Menu-Item-Container' key={index} onClick={() => clickHandler(to)}>
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
                ))}
            </ul>
            
            <article className='Menu-Bottom-Container'>
                <p className='Quantum-Copyright-Text'>Quantum © 2024.</p>
                <Button 
                    title='Terminal' 
                    icon={<BsTerminal />} 
                    variant='Start-Icon Small Extended-Sides Contained' />
            </article>
        </aside>
    );
};

export default Menu;