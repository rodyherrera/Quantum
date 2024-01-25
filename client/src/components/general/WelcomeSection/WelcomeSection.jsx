import React from 'react';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import IconLink from '@components/general/IconLink';
import './WelcomeSection.css';

const WelcomeSection = ({ ...props }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const links = [
        ['Support Us', 'https://github.com/rodyherrera/Quantum/'],
        ['Contribute', 'https://github.com/rodyherrera/Quantum/'],
        ['Github', 'https://github.com/rodyherrera/Quantum/']
    ];

    return (
        <aside id='Welcome-Container' {...props}>
            <p id='Welcome-Title'>
                {(isAuthenticated) ? (
                    <span>Welcome back <b>@{user.username}</b>!</span>
                ) : (
                    <span>You're not authenticated yet.</span>
                )}
            </p>
            <ul id='Welcome-Navigation-Container'>
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