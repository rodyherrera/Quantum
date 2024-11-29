import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyDockerImages } from '@services/docker/image/operations';
import { setState as dockerImgSetState } from '@services/docker/image/slice';

const useUserDockerImages = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const { dockerImages, isLoading, error, stats, isOperationLoading } = useSelector((state) => state.dockerImage);

    useEffect(() => {
        dispatch(getMyDockerImages({ page }));
    }, [page]);
    
    useEffect(() => {
        return () => {
            dispatch(dockerImgSetState({ path: 'images', value: [] }));
        };
    }, []);

    return { dockerImages, isLoading, error, stats, isOperationLoading, page, setPage };
};

export default useUserDockerImages;