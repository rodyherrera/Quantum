import React from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { CiLock, CiUnlock } from 'react-icons/ci';
import { formatDate } from '@utilities/runtime';
import './RepositoryBasicItem.css';

const RepositoryBasicItem = ({ repository, onClick }) => {
    const formatCreationDate = (lastUpdate) => {
        const lastUpdateDate = new Date(lastUpdate);
        const currentDate = new Date();
        const difference = currentDate.getTime() - lastUpdateDate.getTime();
        const differenceInHours = Math.round(difference / (1000 * 3600));
        const differenceInDays = Math.round(difference / (1000 * 3600 * 24));
        if(differenceInHours < 24)
            return `${differenceInHours} hours`;
        return `${differenceInDays} days`;
    };

    return (
        <article className='Repository-Item' onClick={onClick}>
            <article className='Repository-Item-Content'>
                <i className='Repository-Visibility-Icon'>
                    {repository.private ? <CiLock /> : <CiUnlock />}
                </i>
                <h1 className='Repository-Item-Title'>{repository.name}</h1>
                <p className='Repository-Creation-Date'>· {formatDate(repository.created_at)}</p>
            </article>
            <article className='Repository-Item-Actions'>
                <i className='Repository-Item-Import-Icon'>
                    <HiArrowNarrowRight />
                </i>
            </article>
        </article>
    );
};

export default RepositoryBasicItem;