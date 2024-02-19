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

const express = require('express');
const router = express.Router();
const deploymentController = require('@controllers/deployment');
const authMiddleware = require('@middlewares/authentication');
const githubMiddleware = require('@middlewares/github');
const deploymentMiddleware = require('@middlewares/deployment');

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

router.route('/:id', deploymentMiddleware.verifyDeploymentAccess)
    .get(deploymentController.getDeployment)
    .patch(deploymentController.updateDeployment)
    .delete(deploymentController.deleteDeployment);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', deploymentController.getDeployments);

module.exports = router;