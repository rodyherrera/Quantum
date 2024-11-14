import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPortBindings } from '@services/portBinding/operations';
import { setState as portBindingSetState } from '@services/portBinding/slice';

const useUserPortBinding = () => {
    const dispatch = useDispatch();
    const { portBindings, isLoading, error, portBindingStats, isOperationLoading } = useSelector((state) => state.portBinding);
   
    useEffect(() => {
        dispatch(getMyPortBindings());
        return () => {
            dispatch(portBindingSetState({ path: 'portBindings', value: [] }));
        };
    }, []);

    return { portBindings, isLoading, error, portBindingStats, isOperationLoading };
};

export default useUserPortBinding;