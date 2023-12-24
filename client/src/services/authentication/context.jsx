import React, { createContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as authenticationSlice from '@services/authentication/slice';
import * as authenticationService from '@services/authentication/service';

export const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
    const dispatch = useDispatch();

    const signUp = async (body) => {
        try{
            dispatch(authenticationSlice.setIsLoading(true));
            const response = await authenticationService.signUp({ body });
            authenticationService.setCurrentUserToken(response.data.token);
            authenticateWithCachedToken();
        }catch(error){
            dispatch(authenticationService.setError(error));
        }finally{
            dispatch(authenticationSlice.setIsLoading(false));
        }
    };

    const signIn = async (body) => {
        try{
            dispatch(authenticationSlice.setIsLoading(true));
            const response = await authenticationService.signIn({ body });
            authenticationService.setCurrentUserToken(response.data.token);
            authenticateWithCachedToken();
        }catch(error){
            dispatch(authenticationService.setError(error));
        }finally{
            dispatch(authenticationSlice.setIsLoading(false));
        }
    };

    const logout = () => {
        dispatch(authenticationSlice.setIsLoading(true));
        authenticationService.removeCurrentUserToken();
        dispatch(authenticationSlice.setIsAuthenticated(false));
        dispatch(authenticationSlice.setIsLoading(false));
    }

    const authenticateWithCachedToken = async () => {
        try{
            dispatch(authenticationSlice.setIsLoading(true));
            const cachedSessionToken = authenticationService.getCurrentUserToken();
            if(!cachedSessionToken) 
                return;
            const authenticatedUser = await authenticationService.myProfile({});
            dispatch(authenticationSlice.setUser(authenticatedUser.data));
            dispatch(authenticationSlice.setIsAuthenticated(true));
        }catch(error){
            dispatch(authenticationService.setError(error));
        }finally{
            dispatch(authenticationSlice.setIsLoading(false));
        }
    };

    useEffect(() => {
        authenticateWithCachedToken();
    }, []);

    return (
        <AuthenticationContext.Provider value={{
            signUp,
            signIn,
            logout
        }}>
            {children}
        </AuthenticationContext.Provider>
    );
};