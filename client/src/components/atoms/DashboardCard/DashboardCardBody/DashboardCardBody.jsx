import React from 'react';
import { formatDate } from '@utilities/common/dateUtils';
import { IoIosMore } from 'react-icons/io';
import ContextMenu from '@components/organisms/ContextMenu';
import './DashboardCardBody.css';

const DashboardCardBody = ({ name, ctxMenuOpts, updatedAt, createdAt }) => {

    return (
        <div className='Dashboard-Card-Body-Container'>
            <div className='Dashboard-Card-Name-Container'>
                <h3 className='Dashboard-Card-Name'>{name}</h3>
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