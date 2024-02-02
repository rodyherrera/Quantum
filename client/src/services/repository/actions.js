import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';
import * as coreActions from '@services/core/actions';
import { handleAction } from '@services/repository/utils';

export const getMyGithubRepositories = () => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getMyGithubRepositories, {});
};

export const createRepository = (body, navigate) => async (dispatch) => {
    const { data } = await handleAction(dispatch, repositorySlice.setIsOperationLoading, repositoryService.createRepository, { body });
    dispatch(repositorySlice.setSelectedRepository(data));
    navigate(`/repository/${data.name}/deployment/setup/`);
};

export const getRepositories = (setLoaderState = true) => async (dispatch) => {
    const loaderState = setLoaderState ? repositorySlice.setIsLoading : null;
    await handleAction(dispatch, loaderState, repositoryService.getRepositories, {});
};

export const updateRepository = (id, body, navigate) => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsOperationLoading, repositoryService.updateRepository, { body, query: { params: { id } } });
    navigate('/dashboard');
};

export const deleteRepository = (id, repositories, navigate) => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsOperationLoading, repositoryService.deleteRepository, { query: { params: { id } } });
    const updatedRepositories = repositories.filter((repository) => repository._id !== id);
    await dispatch(repositorySlice.setRepositories(updatedRepositories));
    navigate('/dashboard');
};

export const storageExplorer = (id, route) => async (dispatch) => {
    await handleAction(
        dispatch, 
        repositorySlice.setIsOperationLoading, 
        repositoryService.storageExplorer, 
        { query: { params: { id, route } } },
        repositorySlice.setRepositoryFiles);
};

export const readRepositoryFile = (id, route) => async (dispatch) => {
    try{
        dispatch(repositorySlice.setIsOperationLoading(true));
        const body = { query: { params: { id, route } } };
        const response = await repositoryService.readRepositoryFile(body);
        dispatch(repositorySlice.setSelectedRepositoryFile(response.data));
    }catch(error){
        dispatch(coreActions.globalErrorHandler(error, repositorySlice));
    }finally{
        dispatch(repositorySlice.setIsOperationLoading(false));
    }
};

export const updateRepositoryFile = (id, route, content) => async (dispatch) => {
    try{
        dispatch(repositorySlice.setIsOperationLoading(true));
        const body = {
            query: { params: { id, route } },
            body: { content }
        };
        await repositoryService.updateRepositoryFile(body);
    }catch(error){
        dispatch(coreActions.globalErrorHandler(error, repositorySlice));
    }finally{
        dispatch(repositorySlice.setIsOperationLoading(false));
    }
};