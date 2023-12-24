import * as authService from '@services/authentication/service';
import * as authSlice from '@services/authentication/slice';
import * as authLocalStorageService from '@services/authentication/localStorageService';

export const handleAuthentication = async (dispatch, body, authFunction) => {
    try{
        dispatch(authSlice.setIsLoading(true));
        const response = await authFunction({ body });
        authLocalStorageService.setCurrentUserToken(response.data.token);
        dispatch(authSlice.setUser(response.data.user));
        dispatch(authSlice.setIsAuthenticated(true));
    }catch(error){
        dispatch(authSlice.setError(error));
    }finally{
        dispatch(authSlice.setIsLoading(false));
    }
};

export const authenticateWithCachedToken = async (dispatch) => {
    try{
        dispatch(authSlice.setIsCachedAuthLoading(true));
        const cachedSessionToken = authLocalStorageService.getCurrentUserToken();
        if(!cachedSessionToken) 
            return;
        const authenticatedUser = await authService.myProfile({});
        dispatch(authSlice.setUser(authenticatedUser.data));
        dispatch(authSlice.setIsAuthenticated(true));
    }catch(error){
        dispatch(authSlice.setError(error));
    }finally{
        dispatch(authSlice.setIsCachedAuthLoading(false));
    }
};