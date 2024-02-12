import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';
import OperationHandler from '@utilities/operationHandler';

export const createRepository = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);

    operation.on('response', (data) => {
        navigate(`/repository/${data.alias}/deployment/setup/`);
    });

    operation.use({
        api: repositoryService.createRepository,
        loaderState: repositorySlice.setIsOperationLoading,
        responseState: repositorySlice.setSelectedRepository,
        query: { body }
    });
};

export const getRepositories = (setLoaderState = true) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.getRepositories,
        loaderState: setLoaderState ? repositorySlice.setIsLoading : null,
        responseState: repositorySlice.setRepositories
    });
};

export const getMyGithubRepositories = () => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.getMyGithubRepositories,
        loaderState: repositorySlice.setIsLoading,
        responseState: repositorySlice.setGithubRepositories
    });
};

export const updateRepository = (id, body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.on('response', () => navigate('/dashboard/'))
    operation.use({
        api: repositoryService.updateRepository,
        loaderState: repositorySlice.setIsOperationLoading,
        query: { body, query: { params: { id } } }
    });
};

export const deleteRepository = (id, repositories, navigate) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    
    operation.on('finally', () => {
        const updatedRepositories = repositories.filter((repository) => repository._id !== id);
        dispatch(repositorySlice.setRepositories(updatedRepositories));
        navigate('/dashboard/');
    });

    operation.use({
        api: repositoryService.deleteRepository,
        loaderState: repositorySlice.setIsOperationLoading,
        query: { query: { params: { id } } }
    });
};

export const storageExplorer = (id, route) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.storageExplorer,
        loaderState: repositorySlice.setIsOperationLoading,
        responseState: repositorySlice.setRepositoryFiles,
        query: { query: { params: { id, route } } }
    });
};

export const readRepositoryFile = (id, route) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.readRepositoryFile,
        loaderState: repositorySlice.setIsOperationLoading,
        responseState: repositorySlice.setSelectedRepositoryFile,
        query: { query: { params: { id, route } } }
    });
};

export const updateRepositoryFile = (id, route, content) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.updateRepositoryFile,
        loaderState: repositorySlice.setIsOperationLoading,
        query: { query: { params: { id, route } }, body: { content } }
    });
};