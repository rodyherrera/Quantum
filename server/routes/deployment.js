const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deployment');
const authMiddleware = require('../middlewares/authentication');
const githubMiddleware = require('../middlewares/github');

router.use(authMiddleware.protect);

router.get('/repository/:repositoryName/', 
    githubMiddleware.populateGithubAccount, deploymentController.getRepositoryDeployments);

router.delete('/repository/:repositoryName/:deploymentId', 
    githubMiddleware.populateGithubAccount, deploymentController.deleteGithubDeployment);

router.use(authMiddleware.restrictTo('admin'));
router.route('/:id')
    .get(deploymentController.getDeployment)
    .patch(deploymentController.updateDeployment)
    .delete(deploymentController.deleteDeployment);

router.route('/')
    .get(deploymentController.getDeployments)
    .post(deploymentController.createDeployment);

module.exports = router;