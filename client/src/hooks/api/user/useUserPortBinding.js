import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPortBindings } from '@services/portBinding/operations';
import { setState as portBindingSetState } from '@services/portBinding/slice';

const useUserPortBinding = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState();
    const { portBindings, isLoading, error, stats, portBindingStats, isOperationLoading } = useSelector((state) => state.portBinding);

    useEffect(() => {
        dispatch(getMyPortBindings({ page }));
    }, [page]);

    useEffect(() => {
        return () => {
            dispatch(portBindingSetState({ path: 'portBindings', value: [] }));
        };
    }, []);

    return { portBindings, isLoading, stats, error, portBindingStats, isOperationLoading, page, setPage };
};

export default useUserPortBinding;