import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';

export const getMyGithubRepositories = () => async (dispatch) => {
    try{
        dispatch(repositorySlice.setIsLoading(true));
        const response = await repositoryService.getMyGithubRepositories({});
        dispatch(repositorySlice.setRepositories(response.data));
    }catch(error){
        console.log(error)
        dispatch(repositorySlice.setError(error));
    }finally{
        dispatch(repositorySlice.setIsLoading(false));
    }
};

export const createRepository = (body) => async (dispatch) => {
    try{
        dispatch(repositorySlice.setIsCreatingRepo(true));
        await repositoryService.createRepository({ body });
    }catch(error){
        dispatch(repositorySlice.setError(error));
    }finally{
        dispatch(repositorySlice.setIsCreatingRepo(false));
    }
};

export const getRepositories = () => async (dispatch) => {
    try{
        dispatch(repositorySlice.setIsLoading(true));
        const response = await repositoryService.getRepositories({  });
        dispatch(repositorySlice.setRepositories(response.data));
    }catch(error){
        console.log(error)
        dispatch(repositorySlice.setError(error));
    }finally{
        dispatch(repositorySlice.setIsLoading(false));
    }
};