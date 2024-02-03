import * as deploymentService from '@services/deployment/service';
import * as deploymentSlice from '@services/deployment/slice';
import * as repositorySlice from '@services/repository/slice';
import OperationHandler from '@utilities/operationHandler';

export const getRepositoryDeployments = (repositoryAlias) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);
    operation.use({
        api: deploymentService.getRepositoryDeployments,
        loaderState: deploymentSlice.setIsLoading,
        responseState: deploymentSlice.setDeployments,
        query: { query: { params: { repositoryAlias } } }
    });
};

export const deleteRepositoryDeployment = (repositoryAlias, deploymentId) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);
    operation.use({
        api: deploymentService.deleteRepositoryDeployment,
        loaderState: deploymentSlice.setIsOperationLoading,
        responseState: deploymentSlice.setDeployments,
        query: { query: { params: { repositoryAlias, deploymentId } } }
    });
};

export const getActiveDeploymentEnvironment = (repositoryAlias) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);

    operation.on('response', (data) => {
        data.variables = Object.entries(data.variables);
        dispatch(deploymentSlice.setEnvironment(data));
    });

    operation.use({
        api: deploymentService.getActiveDeploymentEnvironment,
        loaderState: deploymentSlice.setIsEnvironmentLoading,
        query: { query: { params: { repositoryAlias } } }
    });
};

export const updateDeployment = (id, body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);
    operation.on('response', () => navigate('/dashboard/'));
    operation.use({
        api: deploymentService.updateDeployment,
        loaderState: deploymentSlice.setIsOperationLoading,
        query: { body, query: { params: { id } } }
    });
};

export const repositoryOperations = (repositoryAlias, body) => async (dispatch) => {
    const operation = new OperationHandler(deploymentSlice, dispatch);

    operation.on('response', ({ status, repository }) => {
        dispatch(repositorySlice.updateDeploymentStatus({ _id: repository._id, status }));
    });

    operation.use({
        api: deploymentService.repositoryOperations,
        loaderState: deploymentSlice.setIsOperationLoading,
        query: { body, query: { params: { repositoryAlias } } }
    });
};