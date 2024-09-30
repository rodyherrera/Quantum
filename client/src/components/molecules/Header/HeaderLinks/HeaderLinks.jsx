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

import React from 'react';
import IconLink from '@components/atoms/IconLink';
import { useSelector, useDispatch } from 'react-redux';
import { setState as coreSetState } from '@services/core/slice';
import './HeaderLinks.css';

const HeaderLinks = () => {
    const { authStatus } = useSelector(state => state.auth);
    const { isCloudConsoleEnabled } = useSelector(state => state.core);
    const dispatch = useDispatch();

    return (
        <article className='Header-Links-Container'>
            <div className='Header-Links-Left-Container'>
                <IconLink title='Create Deployment' to='/repository/create/' />
                <IconLink title='Privacy Policy' to='/legal/privacy-policy/' />
                <IconLink title='Service Status' to='/service-status/' />
            </div>
            <div className='Header-Links-Right-Container'>
                {(authStatus.isAuthenticated) && (
                    <React.Fragment>
                        <IconLink title='My Account' to='/auth/account/' />
                        <IconLink title='Cloud Console' onClick={() => dispatch(coreSetState({ path: 'isCloudConsoleEnabled', value: !isCloudConsoleEnabled }))} />
                    </React.Fragment>
                )}
            </div>
        </article>
    );
};

export default HeaderLinks;