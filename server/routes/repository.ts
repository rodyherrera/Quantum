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
import * as authMiddleware from '@middlewares/authentication';
import * as githubMiddleware from '@middlewares/github';
import Repository from '@models/repository';
import { verifyOwnership } from '@middlewares/common';

const router = express.Router();
const ownership = verifyOwnership(Repository);

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

router.get('/storage/:id/explore/:route?', ownership, repositoryController.storageExplorer);
router.get('/storage/:id/read/:route?', ownership, repositoryController.readRepositoryFile);
router.post('/storage/:id/overwrite/:route?', ownership, repositoryController.updateRepositoryFile);

router.route('/:id')
    .get(ownership, repositoryController.getRepository)
    .patch(ownership, repositoryController.updateRepository)
    .delete(ownership, repositoryController.deleteRepository);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', repositoryController.getRepositories);

export default router;
