import { handleAuthentication } from '@services/authentication/utils';
import * as authService from '@services/authentication/service';
import * as authSlice from '@services/authentication/slice';
import * as authLocalStorageService from '@services/authentication/localStorageService';

export const signUp = (body) => async (dispatch) => {
    await handleAuthentication(dispatch, body, authService.signUp);
};

export const signIn = (body) => async (dispatch) => {
    await handleAuthentication(dispatch, body, authService.signIn);
};

export const logout = async (dispatch) => {
    await dispatch(authSlice.setIsLoading(true));
    authLocalStorageService.removeCurrentUserToken();
    await dispatch(authSlice.setIsAuthenticated(false));
    await dispatch(authSlice.setIsLoading(false));
};