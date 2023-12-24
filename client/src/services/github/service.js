import StandardizedAPIRequestBuilder from '@utilities/standardizedAPIRequestBuilder';
export const GithubAPI = new StandardizedAPIRequestBuilder('/github');

export const createAccount = GithubAPI.register({
    path: '/',
    method: 'POST'
});