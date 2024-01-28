import * as authService from '@services/authentication/service';
import * as authSlice from '@services/authentication/slice';
import * as authLocalStorageService from '@services/authentication/localStorageService';
import * as coreActions from '@services/core/actions';

export const handleAuthentication = async (dispatch, body, authFunction) => {
    try{
        await dispatch(authSlice.setIsLoading(true));
        const response = await authFunction({ body });
        authLocalStorageService.setCurrentUserToken(response.data.token);
        await dispatch(authSlice.setUser(response.data.user));
        await dispatch(authSlice.setIsAuthenticated(true));
    }catch(error){
        dispatch(coreActions.globalErrorHandler(error, authSlice));
    }finally{
        await dispatch(authSlice.setIsLoading(false));
    }
};

export const authenticateWithCachedToken = async (dispatch) => {
    try{
        await dispatch(authSlice.setIsCachedAuthLoading(true));
        const cachedSessionToken = authLocalStorageService.getCurrentUserToken();
        if(!cachedSessionToken) 
            return;
        const authenticatedUser = await authService.myProfile({});
        await dispatch(authSlice.setUser(authenticatedUser.data));
        await dispatch(authSlice.setIsAuthenticated(true));
    }catch(error){
        dispatch(coreActions.globalErrorHandler(error, authSlice));
    }finally{
        await dispatch(authSlice.setIsCachedAuthLoading(false));
    }
};