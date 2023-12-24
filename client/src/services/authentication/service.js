import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const AuthenticationAPI = new StandardizedAPIRequestBuilder('/auth');

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

export const signUp = AuthenticationAPI.register({
    path: '/sign-up/',
    method: 'POST'
});

export const myProfile = AuthenticationAPI.register({
    path: '/me/',
    method: 'GET'
});

export const signIn = AuthenticationAPI.register({
    path: '/sign-in/',
    method: 'POST'
});