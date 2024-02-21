import React from 'react';
import Button from '@components/general/Button';
import { deleteMyProfile } from '@services/authentication/operations';
import { useDispatch, useSelector } from 'react-redux';
import './DeleteAccount.css';

const DeleteAccount = () => {
    const { isEliminatingAccount } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    return (
        <div className='Account-Page-Delete-Container'>
            <div className='Account-Page-Delete-Header-Container'>
                <h3 className='Account-Page-Delete-Title'>Delete <span className='Account-Page-Delete-Title-Highlight'>Account</span></h3>
                <p className='Account-Page-Delete-Description'>Permanently remove your Personal Account and all of its contents from the Quantum platform. This action is not reversible, so please continue with caution. Your services will be permanently deleted.</p>
            </div>
            <div className='Account-Page-Delete-Footer-Container'>
                <Button 
                    isLoading={isEliminatingAccount}
                    onClick={() => dispatch(deleteMyProfile())}
                    variant='White'
                    title='Ok, I agree and I know the consequences.'
                />
            </div>
        </div>
    );
};

export default DeleteAccount;