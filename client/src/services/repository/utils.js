import * as repositorySlice from '@services/repository/slice';

export const handleAction = async (dispatch, action, serviceFunction, body) => {
    try{
        await dispatch(action(true));
        const response = await serviceFunction(body);
        if(Array.isArray(response?.data)){
            await dispatch(repositorySlice.setRepositories(response.data));
            return;
        }
        return response;
    }catch(error){
        await dispatch(repositorySlice.setError(error));
    }finally{
        await dispatch(action(false));
    }
};