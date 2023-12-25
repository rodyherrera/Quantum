import * as repositorySlice from '@services/repository/slice';

export const handleAction = async (dispatch, action, serviceFunction, body) => {
    try{
        dispatch(action(true));
        const response = await serviceFunction(body);
        dispatch(repositorySlice.setRepositories(response.data));
    }catch(error){
        dispatch(repositorySlice.setError(error));
    }finally{
        dispatch(action(false));
    }
};