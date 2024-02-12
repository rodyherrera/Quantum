import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import IconLink from '@components/general/IconLink';
import './WelcomeSection.css';

const WelcomeSection = ({ ...props }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const links = [
        ['Support Us', 'https://ko-fi.com/codewithrodi'],
        ['Contribute', 'https://ko-fi.com/codewithrodi'],
        ['Github', 'https://github.com/rodyherrera/Quantum/']
    ];

    return (
        <aside className='Welcome-Container' {...props}>
            <p className='Welcome-Title'>
                {(isAuthenticated) ? (
                    <span>Welcome back <b>@{user.username}</b>!</span>
                ) : (
                    <span>You're not authenticated yet.</span>
                )}
            </p>
            <ul className='Welcome-Navigation-Container'>
                {links.map(([ title, to ], index) => (
                    <IconLink
                        key={index}
                        icon={<FaLongArrowAltRight />}
                        title={title}
                        to={to} />
                ))}
            </ul>
        </aside> 
    );
};

export default WelcomeSection;