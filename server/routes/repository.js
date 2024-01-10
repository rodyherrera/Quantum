const express = require('express');
const router = express.Router();
const repositoryController = require('@controllers/repository');
const repositoryMiddleware = require('@middlewares/repository');
const authMiddleware = require('@middlewares/authentication');
const githubMiddleware = require('@middlewares/github');

router.use(authMiddleware.protect);

router.get('/me/github/', githubMiddleware.populateRepositories, 
            githubMiddleware.populateGithubAccount, repositoryController.getMyGithubRepositories);

router.get('/me/', githubMiddleware.populateRepositories, 
            githubMiddleware.populateGithubAccount, repositoryController.getMyRepositories);

router.post('/', repositoryController.createRepository);

router.use('/:id', repositoryMiddleware.verifyRepositoryAccess)
    .get('/:id', repositoryController.getRepository)
    .patch('/:id', repositoryController.updateRepository)
    .delete('/:id', repositoryController.deleteRepository);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', repositoryController.getRepositories);

module.exports = router;