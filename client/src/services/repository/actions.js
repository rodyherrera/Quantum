import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';
import { handleAction } from '@services/repository/utils';

export const getMyGithubRepositories = () => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getMyGithubRepositories, {});
};

export const createRepository = (body, navigate) => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsCreatingRepo, repositoryService.createRepository, { body });
    navigate('/dashboard');
};

export const getRepositories = () => async (dispatch) => {
   await handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getRepositories, {});
};

export const updateRepository = (id, body, navigate) => async (dispatch) => {
    await handleAction(dispatch, repositorySlice.setIsUpdatingRepo, repositoryService.updateRepository, { body, query: { params: { id } } });
    navigate('/dashboard');
};