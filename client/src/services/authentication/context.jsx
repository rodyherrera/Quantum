import React, { createContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as authenticationSlice from '@services/authentication/slice';
import * as authenticationService from '@services/authentication/service';

export const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
    const dispatch = useDispatch();

    const signUp = async (body) => {
        try{
            const response = await authenticationService.signUp({ body });
            authenticationService.setCurrentUserToken(response.data.token);
        }catch(error){
            console.log(error);
        }
    };

    const authenticateWithCachedToken = async () => {
        const cachedSessionToken = authenticationService.getCurrentUserToken();
        if(!cachedSessionToken) 
            return;
        const authenticatedUser = await authenticationService.myProfile({});
        dispatch(authenticationSlice.setUser(authenticatedUser.data));
    };

    useEffect(() => {
        authenticateWithCachedToken();
    }, []);

    return (
        <AuthenticationContext.Provider value={{
            signUp
        }}>
            {children}
        </AuthenticationContext.Provider>
    );
};