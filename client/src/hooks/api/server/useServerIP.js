import { useEffect } from 'react';
import { getServerIP } from '@services/core/operations';
import { useDispatch, useSelector } from 'react-redux';

const useServerIP = () => {
    const dispatch = useDispatch();
    const { isServerIPLoading, serverIP } = useSelector((state) => state.core);

    useEffect(() => {
        if(serverIP) return;
        dispatch(getServerIP());
    }, []);

    return { isServerIPLoading, serverIP };
};

export default useServerIP;