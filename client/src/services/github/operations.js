import * as githubService from '@services/github/service';
import * as githubSlice from '@services/github/slice';
import * as authSlice from '@services/authentication/slice';
import OperationHandler from '@utilities/operationHandler';

export const authenticate = async (userId) => {
    const Endpoint = `${import.meta.env.VITE_SERVER + import.meta.env.VITE_API_SUFFIX}/github/authenticate?userId=${userId}`;
    window.location.href = Endpoint;
};

export const createAccount = (body) => async (dispatch) => {
    const operation = new OperationHandler(githubSlice, dispatch);
    operation.use({
        api: githubService.createAccount,
        loaderState: githubSlice.setIsLoading,
        responseState: authSlice.setGithubAccount,
        query: { body }
    });
};