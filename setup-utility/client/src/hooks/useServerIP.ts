import { useQuery } from 'react-query';
import axios from 'axios';

interface ServerIPResponse{
    status: string;
    data: {
        ip: string;
    };
}

const useServerIP = () => {
    const { data, isLoading, error } = useQuery<ServerIPResponse>('serverIP', async () => {
        const response = await axios.get(`${import.meta.env.VITE_SERVER}/host-ip`);
        return response.data;
    });

    return { serverIP: data?.data.ip, isLoading, error };
};

export default useServerIP;