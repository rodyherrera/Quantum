import { useQuery } from 'react-query';
import axios from 'axios';

interface EnvResponse {
    [key: string]: string;
}

const useEnvironVariables = () => {
    const { data, isLoading, error } = useQuery<EnvResponse>('env', async () => {
        const response = await axios.get(`${import.meta.env.VITE_SERVER}/env`);
        return response.data;
    });

    return { environVariables: data, isLoading, error };
};

export default useEnvironVariables;