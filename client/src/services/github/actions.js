import * as githubService from '@services/github/service';
import * as githubSlice from '@services/github/slice';
import * as authSlice from '@services/authentication/slice';
import * as coreActions from '@services/core/actions';

export const authenticate = async (userId) => {
    const Endpoint = `${import.meta.env.VITE_SERVER + import.meta.env.VITE_API_SUFFIX}/github/authenticate?userId=${userId}`;
    window.location.href = Endpoint;
};

export const createAccount = (body) => async (dispatch) => {
    try{
        await dispatch(githubSlice.setIsLoading(true));
        const response = await githubService.createAccount({ body });
        await dispatch(authSlice.setGithubAccount(response.data));
    }catch(error){
        dispatch(coreActions.globalErrorHandler(error, githubSlice));
    }finally{
        await dispatch(githubSlice.setIsLoading(false));
    }
};