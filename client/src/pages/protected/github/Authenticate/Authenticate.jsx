import React, { useEffect } from 'react';
import useQuery from '@hooks/useQuery';
import AnimatedMain from '@components/general/AnimatedMain';
import { useSelector, useDispatch } from 'react-redux';
import { createAccount } from '@services/github/actions';
import { CircularProgress } from '@mui/material';
import './Authenticate.css';

const Authenticate = () => {
    const query = useQuery();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const handleAccountCreation = async () => {
        const accessToken = query.get('accessToken');
        const { id, username, _json } = JSON.parse(query.get('profile'));
        const { avatar_url } = _json;
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
            <CircularProgress size={'2.5rem'} />
            <p>Connecting to your Github account...</p>
        </AnimatedMain>
    );
};

export default Authenticate;