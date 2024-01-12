import * as deploymentService from '@services/deployment/service';
import * as deploymentSlice from '@services/deployment/slice';

const handleDispatch = async (dispatch, action, operation, setIsLoading = false) => {
    try{
        if(setIsLoading) await dispatch(deploymentSlice[operation](true));
        const response = await action();
        await dispatch(deploymentSlice.setDeployments(response.data));
    }catch(error){
        await dispatch(deploymentSlice.setError(error));
    }finally{
        if(setIsLoading) await dispatch(deploymentSlice[operation](false));
    }
};

export const getRepositoryDeployments = (repositoryName) => async (dispatch) => {
    const query = { params: { repositoryName } };
    const action = () => deploymentService.getRepositoryDeployments({ query });
    await handleDispatch(dispatch, action, 'setIsLoading', true);
};

export const deleteRepositoryDeployment = (repositoryName, deploymentId) => async (dispatch) => {
    const query = { params: { repositoryName, deploymentId } };
    const action = () => deploymentService.deleteRepositoryDeployment({ query });
    await handleDispatch(dispatch, action, 'setIsOperationLoading', true);
};

export const getActiveDeploymentEnvironment = (repositoryName) => async (dispatch) => {
    const query = { params: { repositoryName } };

    await handleDispatch(dispatch, async () => {
        const response = await deploymentService.getActiveDeploymentEnvironment({ query });
        await dispatch(deploymentSlice.setEnvironment(response.data._id));
        const sanitizedData = Object.entries(response.data.variables);
        await dispatch(deploymentSlice.setEnvironmentVariables(sanitizedData));
    }, 'setIsEnvironmentLoading', true);
};

export const updateDeployment = (id, body, navigate) => async (dispatch) => {
    const query = { params: { id } };
    await handleDispatch(dispatch, async () => {
        await deploymentService.updateDeployment({ query, body });
        navigate('/dashboard/');
    }, 'setIsLoading', true);
};