/***
 * Copyright (C) Rodolfo Herrera Hernandez. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project root
 * for full license information.
 *
 * =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
 *
 * For related information - https://github.com/rodyherrera/Quantum/
 *
 * All your applications, just in one place. 
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

import * as repositoryService from '@services/repository/service';
import * as repositorySlice from '@services/repository/slice';
import OperationHandler from '@utilities/api/operationHandler';

/**
 * @function createRepository
 * @description Creates a new repository in Quantum Cloud. 
 * @param {Object} body - Repository configuration data.
 * @param {function} navigate - Navigation function (likely from a routing library).
 * @returns {Promise} Resolves when the repository is successfully created.
*/
export const createRepository = (body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);

    operation.on('response', (data) => {
        navigate(`/repository/${data.alias}/deployment/setup/`);
    });

    operation.use({
        api: repositoryService.createRepository,
        loaderState: repositorySlice.setIsOperationLoading,
        responseState: repositorySlice.setSelectedRepository,
        query: { body }
    });
};

/**
 * @function getRepositories
 * @description Fetches a list of repositories from Quantum Cloud. 
 * @param {function} [setLoaderState=true] - Optional function to update a loading state in UI.
 * @returns {Promise} Resolves when the repositories are received.
*/
export const getRepositories = (setLoaderState = true) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.getRepositories,
        loaderState: setLoaderState ? repositorySlice.setIsLoading : null,
        responseState: repositorySlice.setRepositories
    });
};

/**
 * @function getMyGithubRepositories
 * @description Retrieves a list of the user's repositories from GitHub.
 * @returns {Promise} Resolves with the list of GitHub repositories.
*/
export const getMyGithubRepositories = () => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.getMyGithubRepositories,
        loaderState: repositorySlice.setIsLoading,
        responseState: repositorySlice.setGithubRepositories
    });
};

/**
 * @function updateRepository
 * @description Updates the details of an existing repository.
 * @param {string} id - The ID of the repository to update.
 * @param {Object} body - The updated repository data.
 * @param {function} navigate - Navigation function (likely from a routing library).
 * @returns {Promise} Resolves when the repository is updated.
*/
export const updateRepository = (id, body, navigate) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.on('response', () => navigate('/dashboard/'));
    operation.use({
        api: repositoryService.updateRepository,
        loaderState: repositorySlice.setIsOperationLoading,
        query: { body, query: { params: { id } } }
    });
};

/**
 * @function deleteRepository
 * @description Deletes a repository from Quantum Cloud.
 * @param {string} id - The ID of the repository to delete.
 * @param {Array} repositories - The current list of repositories.
 * @param {function} navigate - Navigation function (likely from a routing library).
 * @returns {Promise} Resolves when the repository is deleted.
*/
export const deleteRepository = (id, repositories, navigate) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    
    operation.on('finally', () => {
        const updatedRepositories = repositories.filter((repository) => repository._id !== id);
        dispatch(repositorySlice.setRepositories(updatedRepositories));
        navigate('/dashboard/');
    });

    operation.use({
        api: repositoryService.deleteRepository,
        loaderState: repositorySlice.setIsOperationLoading,
        query: { query: { params: { id } } }
    });
};

/**
 * @function storageExplorer
 * @description Retrieves a directory listing from a repository's storage.
 * @param {string} id - The repository's identifier.
 * @param {string} route - The directory path within the repository.
 * @returns {Promise} Resolves when the directory listing is fetched.
*/
export const storageExplorer = (id, route) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.storageExplorer,
        loaderState: repositorySlice.setIsOperationLoading,
        responseState: repositorySlice.setRepositoryFiles,
        query: { query: { params: { id, route } } }
    });
};

/**
 * @function readRepositoryFile
 * @description Reads the contents of a file from a repository's storage.
 * @param {string} id - The repository's identifier.
 * @param {string} route - The file path within the repository.
 * @returns {Promise} Resolves when the file contents are fetched. 
*/
export const readRepositoryFile = (id, route) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.readRepositoryFile,
        loaderState: repositorySlice.setIsOperationLoading,
        responseState: repositorySlice.setSelectedRepositoryFile,
        query: { query: { params: { id, route } } }
    });
};

/**
 * @function updateRepositoryFile
 * @description Updates the contents of a file in a repository's storage.
 * @param {string} id - The repository's identifier.
 * @param {string} route - The file path within the repository.
 * @param {string} content - The updated file content.
 * @returns {Promise} Resolves when the file content is updated.
*/
export const updateRepositoryFile = (id, route, content) => async (dispatch) => {
    const operation = new OperationHandler(repositorySlice, dispatch);
    operation.use({
        api: repositoryService.updateRepositoryFile,
        loaderState: repositorySlice.setIsOperationLoading,
        query: { query: { params: { id, route } }, body: { content } }
    });
};
