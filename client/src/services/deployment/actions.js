import * as deploymentService from '@services/deployment/service';
import * as deploymentSlice from '@services/deployment/slice';

export const getRepositoryDeployments = (repositoryName) => async (dispatch) => {
    try{
        await dispatch(deploymentSlice.setIsLoading(true));
        const response = await deploymentService.getRepositoryDeployments({ 
            query: { params: { repositoryName: repositoryName } }
        });
        await dispatch(deploymentSlice.setDeployments(response.data));
    }catch(error){
        await dispatch(deploymentSlice.setError(error));
    }finally{
        await dispatch(deploymentSlice.setIsLoading(false));
    }
};

export const deleteRepositoryDeployment = (repositoryName, deploymentId) => async (dispatch) => {
    try{
        await dispatch(deploymentSlice.setIsOperationLoading(true));
        const response = await deploymentService.deleteRepositoryDeployment({ 
            query: { params: { repositoryName: repositoryName, deploymentId: deploymentId } }
        });
        await dispatch(deploymentSlice.setDeployments(response.data));
    }catch(error){
        await dispatch(deploymentSlice.setError(error));
    }finally{
        await dispatch(deploymentSlice.setIsOperationLoading(false));
    }
};