import axios from 'axios';

export type EnvVariables = Record<string, string | undefined>;

export const fetchEnvironVariables = async (): Promise<EnvVariables> => {
    const { data } = await axios.get<EnvVariables>(`${import.meta.env.VITE_SERVER}/env`);
    return data;
};

export const updateEnvVariables = async (variables: EnvVariables): Promise<EnvVariables> => {
    const { data } = await axios.post<EnvVariables>(`${import.meta.env.VITE_SERVER}/env`, variables, {
        headers: { 'Content-Type': 'application/json' }
    });
    return data;
};
