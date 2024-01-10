import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';
import { handleAction } from '@services/repository/utils';

export const getMyGithubRepositories = () => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getMyGithubRepositories, {});
};

export const createRepository = (body, navigate) => async (dispatch) => {
    const { data } = await handleAction(dispatch, repositorySlice.setIsOperationLoading, repositoryService.createRepository, { body });
    navigate(`/repository/${data.name}/deployment/setup/`, { state: { repository: data } })
};

export const getRepositories = () => async (dispatch) => {
   await handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getRepositories, {});
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