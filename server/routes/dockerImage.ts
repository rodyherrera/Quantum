import express from 'express';
import * as dockerImageController from '@controllers/docker/image';
import * as authMiddleware from '@middlewares/authentication';

const router = express.Router();

router.use(authMiddleware.protect);
router.post('/', dockerImageController.createDockerImage);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', dockerImageController.getDockerImages)

router.route('/:id')
    .get(dockerImageController.getDockerImage)
    .patch(dockerImageController.updateDockerImage)
    .delete(dockerImageController.deleteDockerImage);

export default router;