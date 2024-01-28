import * as repositorySlice from '@services/repository/slice';
import * as coreActions from '@services/core/actions';

export const handleAction = async (dispatch, action, serviceFunction, body) => {
    try{
        if(action !== null) await dispatch(action(true));
        const response = await serviceFunction(body);
        if(Array.isArray(response?.data)){
            await dispatch(repositorySlice.setRepositories(response.data));
            return;
        }
        return response;
    }catch(error){
        dispatch(coreActions.globalErrorHandler(error, repositorySlice));
    }finally{
        if(action !== null) await dispatch(action(false));
    }
};