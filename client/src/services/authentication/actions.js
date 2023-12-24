import { handleAuthentication } from '@services/authentication/utils';
import * as authService from '@services/authentication/service';
import * as authSlice from '@services/authentication/slice';
import * as authLocalStorageService from '@services/authentication/localStorageService';

export const signUp = (body) => async (dispatch) => {
    handleAuthentication(dispatch, body, authService.signUp);
};

export const signIn = (body) => async (dispatch) => {
    handleAuthentication(dispatch, body, authService.signIn);
};

export const logout = async (dispatch) => {
    dispatch(authSlice.setIsLoading(true));
    authLocalStorageService.removeCurrentUserToken();
    dispatch(authSlice.setIsAuthenticated(false));
    dispatch(authSlice.setIsLoading(false));
};