import { useDispatch, useSelector } from 'react-redux';
import { deletePortBinding } from '@services/portBinding/operations';

const useDeletePortBinding = (documentId) => {
    const dispatch = useDispatch();
    const { portBindings } = useSelector((state) => state.portBinding);

    const deletePortBindingHandler = () => {
        dispatch(deletePortBinding(documentId, portBindings));
    };
    
    return deletePortBindingHandler;
};

export default useDeletePortBinding;