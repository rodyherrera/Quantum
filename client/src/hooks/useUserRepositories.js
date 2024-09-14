import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRepositories } from '@services/repository/operations';

const useUserRepositories = () => {
    const dispatch = useDispatch();
    const { repositories, isLoading, isOperationLoading, error } = useSelector(state => state.repository);

    useEffect(() => {
        // If there are already repositories saved in memory, the loading component will 
        // not be displayed by default. The "getRepositories" function receives an optional 
        // boolean, which will indicate whether you want to update the "isLoading" state. Therefore 
        // we check the length of the saved repositories.
        const useLoaderState = !repositories.length;
        dispatch(getRepositories(useLoaderState));

        const intervalId = setInterval(() => {
            dispatch(getRepositories(false));
        }, 15000);

        return () => clearInterval(intervalId);
    }, []);

    return { repositories, isLoading, isOperationLoading, error };
};

export default useUserRepositories;