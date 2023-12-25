import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';
import { handleAction } from '@services/repository/utils';

export const getMyGithubRepositories = () => async (dispatch) => {
    handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getMyGithubRepositories, {});
};

export const createRepository = (body) => async (dispatch) => {
    handleAction(dispatch, repositorySlice.setIsCreatingRepo, repositoryService.createRepository, { body });
};

export const getRepositories = () => async (dispatch) => {
    handleAction(dispatch, repositorySlice.setIsLoading, repositoryService.getRepositories, {});
};