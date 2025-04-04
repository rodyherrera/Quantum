import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRepositories } from '@services/repository/operations';
import { setState as repoSetState } from '@services/repository/slice';

const useUserRepositories = () => {
    const dispatch = useDispatch();
    const { repositories, isLoading, isOperationLoading, error, stats } = useSelector(state => state.repository);

    useEffect(() => {
        dispatch(getRepositories());
        
        const intervalId = setInterval(() => {
            dispatch(getRepositories(false));
        }, 15000);

        return () => {
            clearInterval(intervalId);
            dispatch(repoSetState({ path: 'repositories', value: [] }));
        }
    }, []);

    return { repositories, isLoading, isOperationLoading, error, stats, isOperationLoading };
};

export default useUserRepositories;