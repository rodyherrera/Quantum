const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deployment');
const authMiddleware = require('../middlewares/authentication');

router.use(authMiddleware.restrictTo('admin'));
router.route('/:id')
    .get(deploymentController.getDeployment)
    .patch(deploymentController.updateDeployment)
    .delete(deploymentController.deleteDeployment);

router.route('/')
    .get(deploymentController.getDeployments)
    .post(deploymentController.createDeployment);

module.exports = router;