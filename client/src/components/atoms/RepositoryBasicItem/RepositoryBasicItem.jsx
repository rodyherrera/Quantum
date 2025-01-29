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

import { HiArrowNarrowRight } from 'react-icons/hi';
import { CiLock, CiUnlock } from 'react-icons/ci';
import { formatDate } from '@utilities/common/dateUtils';
import './RepositoryBasicItem.css';

const RepositoryBasicItem = ({ repository, onClick }) => {
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