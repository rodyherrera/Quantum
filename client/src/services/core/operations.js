import * as authSlice from '@services/authentication/slice';
import * as deploymentSlice from '@services/deployment/slice';
import * as githubSlice from '@services/github/slice';
import * as repositorySlice from '@services/repository/slice';
import * as coreService from '@services/core/service';
import * as coreSlice from '@services/core/slice';
import errorCodeHandler from '@services/core/errorCodeHandler';
import { addError } from '@services/core/slice';
import OperationHandler from '@utilities/operationHandler';

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
    const operation = new OperationHandler(coreSlice, dispatch);
    operation.use({
        api: coreService.getServerHealth,
        responseState: coreSlice.setServerHealth,
        loaderState: coreSlice.setIsServerHealthLoading
    });
};