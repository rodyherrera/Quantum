import * as githubService from '@services/github/service';
import * as githubSlice from '@services/github/slice';
import * as authSlice from '@services/authentication/slice';

export const authenticate = async (userId) => {
    const Endpoint = `${import.meta.env.VITE_SERVER + import.meta.env.VITE_API_SUFFIX}/github/authenticate?userId=${userId}`;
    window.location.href = Endpoint;
};

export const createAccount = (body) => async (dispatch) => {
    try{
        dispatch(githubSlice.setIsLoading(true));
        const response = await githubService.createAccount({ body });
        dispatch(authSlice.setGithubAccount(response.data));
    }catch(error){
        dispatch(githubSlice.setError(error));
    }finally{
        dispatch(githubSlice.setIsLoading(false));
    }
};