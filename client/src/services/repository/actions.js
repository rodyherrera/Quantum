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