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

import express from 'express';
import * as repositoryController from '@controllers/repository';
import * as repositoryMiddleware from '@middlewares/repository';
import * as authMiddleware from '@middlewares/authentication';
import * as githubMiddleware from '@middlewares/github';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/me/github/',
    githubMiddleware.populateRepositories,
    githubMiddleware.populateGithubAccount,
    repositoryController.getMyGithubRepositories);

router.get('/me/',
    githubMiddleware.populateRepositories,
    githubMiddleware.populateGithubAccount,
    repositoryController.getMyRepositories);

router.post('/',repositoryController.createRepository);

router.get('/storage/:id/explore/:route?',
    repositoryMiddleware.verifyRepositoryAccess,
    repositoryController.storageExplorer);

router.get('/storage/:id/read/:route?',
    repositoryMiddleware.verifyRepositoryAccess,
    repositoryController.readRepositoryFile);

router.post('/storage/:id/overwrite/:route?',
    repositoryMiddleware.verifyRepositoryAccess,
    repositoryController.updateRepositoryFile);

router.route('/:id', repositoryMiddleware.verifyRepositoryAccess)
    .get(repositoryController.getRepository)
    .patch(repositoryController.updateRepository)
    .delete(repositoryController.deleteRepository);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', repositoryController.getRepositories);

export default router;
