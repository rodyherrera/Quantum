import { useQuery } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { setEnvironVariables } from '@services/env/slice';
import { fetchEnvironVariables, EnvVariables } from '@services/env/api';
import { RootState } from '@services/store';

const useEnvironVariables = () => {
    const dispatch = useDispatch();
    const environVariables = useSelector((state: RootState) => state.env.environVariables);

    const { isLoading, error } = useQuery<EnvVariables>('env', fetchEnvironVariables,
        {
            onSuccess: (data) => {
                dispatch(setEnvironVariables(data));
            }
        }
    );

    return { environVariables, isLoading, error };
};

export default useEnvironVariables;
