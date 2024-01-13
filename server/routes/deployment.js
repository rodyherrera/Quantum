const express = require('express');
const router = express.Router();
const deploymentController = require('@controllers/deployment');
const authMiddleware = require('@middlewares/authentication');
const githubMiddleware = require('@middlewares/github');
const deploymentMiddleware = require('@middlewares/deployment');

router.use(authMiddleware.protect);

router.get('/repository/:repositoryName/', 
    githubMiddleware.populateGithubAccount, deploymentController.getRepositoryDeployments);

router.get('/repository/:repositoryName/environment/',
    githubMiddleware.populateGithubAccount, deploymentController.getActiveDeploymentEnvironment);

router.delete('/repository/:repositoryName/:deploymentId', 
    githubMiddleware.populateGithubAccount, deploymentController.deleteGithubDeployment);

router.route('/:id', deploymentMiddleware.verifyDeploymentAccess)
    .get(deploymentController.getDeployment)
    .patch(deploymentController.updateDeployment)
    .delete(deploymentController.deleteDeployment);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', deploymentController.getDeployments);

module.exports = router;