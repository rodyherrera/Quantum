import * as repositorySlice from '@services/repository/slice';

export const handleAction = async (dispatch, action, serviceFunction, body) => {
    try{
        await dispatch(action(true));
        const response = await serviceFunction(body);
        await dispatch(repositorySlice.setRepositories(response.data));
    }catch(error){
        await dispatch(repositorySlice.setError(error));
    }finally{
        await dispatch(action(false));
    }
};