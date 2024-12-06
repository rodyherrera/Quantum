import { useQuery } from 'react-query';
import { setEnvironVariables } from '@services/env/slice';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

interface EnvResponse {
    [key: string]: string;
}

const useEnvironVariables = () => {
    const dispatch = useDispatch();
    const { environVariables } = useSelector((state: any) => state.env);

    const { isLoading, error } = useQuery<EnvResponse>('env', async () => {
        const response = await axios.get(`${import.meta.env.VITE_SERVER}/env`);
        dispatch(setEnvironVariables(response.data));
        return response.data;
    });

    return { environVariables, isLoading, error };
};

export default useEnvironVariables;