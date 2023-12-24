import * as authenticationService from '@services/authentication/service';
import * as authenticationSlice from '@services/authentication/slice';

export const handleAuthentication = async (dispatch, body, authFunction) => {
    try{
        dispatch(authenticationSlice.setIsLoading(true));
        const response = await authFunction({ body });
        authenticationService.setCurrentUserToken(response.data.token);
        authenticateWithCachedToken(dispatch);
    }catch(error){
        dispatch(authenticationSlice.setError(error));
    }finally{
        dispatch(authenticationSlice.setIsLoading(false));
    }
};

export const authenticateWithCachedToken = async (dispatch) => {
    try{
        dispatch(authenticationSlice.setIsCachedAuthenticationLoading(true));
        const cachedSessionToken = authenticationService.getCurrentUserToken();
        if(!cachedSessionToken) 
            return;
        const authenticatedUser = await authenticationService.myProfile({});
        dispatch(authenticationSlice.setUser(authenticatedUser.data));
        dispatch(authenticationSlice.setIsAuthenticated(true));
    }catch(error){
        dispatch(authenticationService.setError(error));
    }finally{
        dispatch(authenticationSlice.setIsCachedAuthenticationLoading(false));
    }
};