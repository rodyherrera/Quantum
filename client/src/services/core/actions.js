import * as authSlice from '@services/authentication/slice';
import * as deploymentSlice from '@services/deployment/slice';
import * as githubSlice from '@services/github/slice';
import * as repositorySlice from '@services/repository/slice';
import { addError } from '@services/core/slice';

export const globalErrorHandler = (message, slice = null) => (dispatch) => {
    const error = {
        id: new Date().getTime(),
        message
    };
    dispatch(addError(error));
    if(slice === null) return;
    dispatch(slice.setError(message));
};

export const resetErrorForAllSlices = () => (dispatch) => {
    dispatch(authSlice.setError(null));
    dispatch(deploymentSlice.setError(null));
    dispatch(githubSlice.setError(null));
    dispatch(repositorySlice.setError(null));
};