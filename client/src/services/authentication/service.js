import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const AuthenticationAPI = new StandardizedAPIRequestBuilder('/auth');

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