import * as authSlice from '@services/authentication/slice';
import * as deploymentSlice from '@services/deployment/slice';
import * as githubSlice from '@services/github/slice';
import * as repositorySlice from '@services/repository/slice';
import * as coreService from '@services/core/service';
import * as coreSlice from '@services/core/slice';
import errorCodeHandler from '@services/core/errorCodeHandler';
import { addError } from '@services/core/slice';

export const globalErrorHandler = (message, slice = null) => (dispatch) => {
    const error = {
        id: new Date().getTime(),
        message
    };
    dispatch(addError(error));
    if(slice === null) return;
    const readableError = errorCodeHandler(message);
    dispatch(slice.setError(readableError));
};

export const resetErrorForAllSlices = () => (dispatch) => {
    dispatch(authSlice.setError(null));
    dispatch(deploymentSlice.setError(null));
    dispatch(githubSlice.setError(null));
    dispatch(repositorySlice.setError(null));
    dispatch(coreSlice.setError(null));
};

export const getServerHealth = () => async (dispatch) => {
    try{
        dispatch(coreSlice.setIsServerHealthLoading(true));
        const response = await coreService.getServerHealth({});
        dispatch(coreSlice.setServerHealth(response.data));
    }catch(error){
        dispatch(globalErrorHandler(error, coreSlice));
    }finally{
        dispatch(coreSlice.setIsServerHealthLoading(false));
    }
};