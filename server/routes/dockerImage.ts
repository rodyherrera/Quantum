import express from 'express';
import * as dockerImageController from '@controllers/docker/image';
import * as authMiddleware from '@middlewares/authentication';

const router = express.Router();

router.use(authMiddleware.protect);
router.get('/me/', dockerImageController.getMyDockersImage);
router.post('/', dockerImageController.createDockerImage);

// Verify ownership
router.route('/:id')
    .get(dockerImageController.getDockerImage)
    .patch(dockerImageController.updateDockerImage)
    .delete(dockerImageController.deleteDockerImage);

router.use(authMiddleware.restrictTo('admin'));
router.get('/', dockerImageController.getDockerImages)

export default router;