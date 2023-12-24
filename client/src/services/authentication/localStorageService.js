const localStorageId = 'Quantum::Authentication::Token';

export const setCurrentUserToken = (token) => {
    localStorage.setItem(localStorageId, token);
};

export const getCurrentUserToken = () => {
    return localStorage.getItem(localStorageId);
};

export const removeCurrentUserToken = () => {
    localStorage.removeItem(localStorageId);
};