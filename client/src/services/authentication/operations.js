import * as authService from '@services/authentication/service';
import * as authSlice from '@services/authentication/slice';
import * as authLocalStorageService from '@services/authentication/localStorageService';
import OperationHandler from '@utilities/operationHandler';

const handleAuthResponse = (data, dispatch) => {
    authLocalStorageService.setCurrentUserToken(data.token);
    dispatch(authSlice.setUser(data.user));
    dispatch(authSlice.setIsAuthenticated(true));
};

export const signUp = (body) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signUp,
        loaderState: authSlice.setIsLoading,
        query: { body }
    });
};

export const signIn = (body) => async (dispatch) => {
    const operation = new OperationHandler(authSlice, dispatch);
    operation.on('response', (data) => handleAuthResponse(data, dispatch));
    operation.use({
        api: authService.signIn,
        loaderState: authSlice.setIsLoading,
        query: { body }
    });
};

export const logout = () => async (dispatch) => {
    await dispatch(authSlice.setIsLoading(true));
    authLocalStorageService.removeCurrentUserToken();
    await dispatch(authSlice.setIsAuthenticated(false));
    await dispatch(authSlice.setIsLoading(false));
};