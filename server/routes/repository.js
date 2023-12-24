const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repository');
const authMiddleware = require('../middlewares/authentication');
const githubMiddleware = require('../middlewares/github');

router.use(authMiddleware.protect);
router.get('/me/github/', githubMiddleware.populateGithubAccount, repositoryController.getMyGithubRepositories);

router.use(authMiddleware.restrictTo('admin'));
router.route('/:id')
    .get(repositoryController.getRepository)
    .patch(repositoryController.updateRepository)
    .delete(repositoryController.deleteRepository);

router.route('/')
    .get(repositoryController.getRepositories)
    .post(repositoryController.createRepository);

module.exports = router;