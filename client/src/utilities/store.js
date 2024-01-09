import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@services/authentication/slice';
import githubReducer from '@services/github/slice';
import repositoryReducer from '@services/repository/slice';
import deploymentReducer from '@services/deployment/slice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        github: githubReducer,
        repository: repositoryReducer,
        deployment: deploymentReducer
    }
});

export default store;