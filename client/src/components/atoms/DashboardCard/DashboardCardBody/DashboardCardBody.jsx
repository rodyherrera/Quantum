import React from 'react';
import { formatDate } from '@utilities/common/dateUtils';
import { IoIosMore } from 'react-icons/io';
import ContextMenu from '@components/organisms/ContextMenu';
import './DashboardCardBody.css';

const DashboardCardBody = ({ name, headerBadges = null, ctxMenuOpts, updatedAt, createdAt }) => {

    return (
        <div className='Dashboard-Card-Body-Container'>
            <div className='Dashboard-Card-Name-Container'>
                <div className='Dashboard-Card-Header-Left-Container'>
                    <h3 className='Dashboard-Card-Name'>{name}</h3>
                    {headerBadges && (
                        <div className='Dashboard-Card-Header-Badges'>
                            {headerBadges.map(({ title, Icon, onClick = () => {} }, index) => (
                                <div className='Dashboard-Card-Header-Badge-Container' onClick={onClick} key={index}>
                                    <span className='Dashboard-Card-Header-Badge'>{title}</span>
                                    {Icon && (
                                        <i className='Dashboard-Card-Header-Badge-Icon'>
                                            <Icon />
                                        </i>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <ContextMenu 
                    className='Dashboard-Card-More-Icon-Container'
                    options={ctxMenuOpts}
                >
                    <i>
                        <IoIosMore />
                    </i>
                </ContextMenu>
            </div>
            <p className='Docker-Container-Last-Update'>Last update {formatDate(updatedAt)}, created at {formatDate(createdAt, true)}.</p>
        </div>
    );
};

export default DashboardCardBody