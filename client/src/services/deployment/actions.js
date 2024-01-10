import * as deploymentService from '@services/deployment/service';
import * as deploymentSlice from '@services/deployment/slice';

const handleDispatch = async (dispatch, action, operation) => {
    try{
        await dispatch(deploymentSlice[operation](true));
        const response = await action();
        await dispatch(deploymentSlice.setDeployments(response.data));
    }catch(error){
        await dispatch(deploymentSlice.setError(error));
    }finally{
        await dispatch(deploymentSlice[operation](false));
    }
};

export const getRepositoryDeployments = (repositoryName) => async (dispatch) => {
    const query = { params: { repositoryName } };
    const action = () => deploymentService.getRepositoryDeployments({ query });
    await handleDispatch(dispatch, action, 'setIsLoading');
};

export const deleteRepositoryDeployment = (repositoryName, deploymentId) => async (dispatch) => {
    const query = { params: { repositoryName, deploymentId } };
    const action = () => deploymentService.deleteRepositoryDeployment({ query });
    await handleDispatch(dispatch, action, 'setIsOperationLoading');
};