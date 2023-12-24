import { handleAuthentication  } from '@services/authentication/utils';
import * as authenticationService from '@services/authentication/service';
import * as authenticationSlice from '@services/authentication/slice';

export const signUp = (body) => async (dispatch) => {
    handleAuthentication(dispatch, body, authenticationService.signUp);
};

export const signIn = (body) => async (dispatch) => {
    handleAuthentication(dispatch, body, authenticationService.signIn);
};

export const logout = async (dispatch) => {
    dispatch(authenticationSlice.setIsLoading(true));
    authenticationService.removeCurrentUserToken();
    dispatch(authenticationSlice.setIsAuthenticated(false));
    dispatch(authenticationSlice.setIsLoading(false));
};