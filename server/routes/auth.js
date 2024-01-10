const express = require('express');
const router = express.Router();
const authenticationController = require('@controllers/authentication');
const authenticationMiddleware = require('@middlewares/authentication');

router.post('/sign-in', authenticationController.signIn);
router.post('/sign-up', authenticationController.signUp);

router.use(authenticationMiddleware.protect);
router.patch('/me/update/password/', authenticationController.updateMyPassword);

router.route('/me')
    .get(authenticationController.getMyAccount)
    .patch(authenticationController.updateMyAccount)
    .delete(authenticationController.deleteMyAccount);

router.use(authenticationMiddleware.restrictTo('admin'));

router.route('/:id')
    .get(authenticationController.getUser)
    .patch(authenticationController.updateUser)
    .delete(authenticationController.deleteUser);

router.route('/')
    .get(authenticationController.getAllUsers)
    .post(authenticationController.createUser);

module.exports = router;