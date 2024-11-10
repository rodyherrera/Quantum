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

import React, { useEffect } from 'react';
import { useQuery } from '@hooks/common/';
import AnimatedMain from '@components/atoms/AnimatedMain';
import { useSelector, useDispatch } from 'react-redux';
import { createAccount } from '@services/github/operations';
import Loader from '@components/atoms/Loader';
import './Authenticate.css';

const Authenticate = () => {
    const query = useQuery();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const handleAccountCreation = async () => {
        const accessToken = query.get('accessToken');
        const { id, username, avatar_url } = JSON.parse(query.get('data'));
        const body = {
            accessToken,
            username,
            githubId: id,
            user: user._id,
            avatarUrl: avatar_url
        };
        await dispatch(createAccount(body));
    };

    useEffect(() => {
        handleAccountCreation();
    }, []);

    return (
        <AnimatedMain id='Github-Authenticate-Main'>
            <Loader scale='0.7' />
            <p>Connecting to your Github account...</p>
        </AnimatedMain>
    );
};

export default Authenticate;