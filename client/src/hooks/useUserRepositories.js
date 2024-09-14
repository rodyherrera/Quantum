import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRepositories } from '@services/repository/operations';
import { setRepositories } from '@services/repository/slice';

const useUserRepositories = () => {
    const dispatch = useDispatch();
    const { repositories, isLoading, isOperationLoading, error } = useSelector(state => state.repository);

    useEffect(() => {
        dispatch(getRepositories());

        const intervalId = setInterval(() => {
            dispatch(getRepositories(false));
        }, 15000);

        return () => {
            clearInterval(intervalId);
            dispatch(setRepositories([]));
        }
    }, []);

    return { repositories, isLoading, isOperationLoading, error };
};

export default useUserRepositories;