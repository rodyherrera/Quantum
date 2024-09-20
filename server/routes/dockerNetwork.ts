import express from 'express';
import * as dockerNetworkController from '@controllers/docker/network';
import * as authMiddleware from '@middlewares/authentication';

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/me/', dockerNetworkController.getMyDockersNetwork);
router.post('/', dockerNetworkController.createDockerNetwork);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', dockerNetworkController.getDockerNetworks);

router.route('/:id')
    .get(dockerNetworkController.getDockerNetwork)
    .patch(dockerNetworkController.updateDockerNetwork)
    .delete(dockerNetworkController.deleteDockerNetwork);

export default router;