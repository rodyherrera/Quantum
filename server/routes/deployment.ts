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
import * as deploymentController from '@controllers/deployment';
import * as authMiddleware from '@middlewares/authentication';
import * as githubMiddleware from '@middlewares/github';
import * as deploymentMiddleware from '@middlewares/deployment';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/repository/:repositoryName/',
    githubMiddleware.populateGithubAccount,
    deploymentController.getRepositoryDeployments);

router.get('/repository/:repositoryAlias/environment/',
    githubMiddleware.populateGithubAccount,
    deploymentController.getActiveDeploymentEnvironment);

router.delete('/repository/:repositoryName/:deploymentId',
    githubMiddleware.populateGithubAccount,
    deploymentController.deleteGithubDeployment);

router.post('/repository/:repositoryAlias/actions/',
    deploymentController.repositoryOperations);

router.use('/:id', deploymentMiddleware.verifyDeploymentAccess);
router.route('/:id')
    .get(deploymentController.getDeployment)
    .patch(deploymentController.updateDeployment)
    .delete(deploymentController.deleteDeployment);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', deploymentController.getDeployments);

export default router;
