import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyPortBindings } from '@services/portBinding/operations';
import { setState as portBindingSetState } from '@services/portBinding/slice';

const useUserPortBinding = () => {
    const dispatch = useDispatch();
    const { portBindings, isLoading, error, stats } = useSelector((state) => state.portBinding);
   
    useEffect(() => {
        console.log(portBindings)
    }, [portBindings])

    useEffect(() => {
        dispatch(getMyPortBindings());
        return () => {
            dispatch(portBindingSetState({ path: 'portBindings', value: [] }));
        };
    }, []);

    return { portBindings, isLoading, error, stats };
};

export default useUserPortBinding;