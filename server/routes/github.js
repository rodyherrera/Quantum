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
const githubController = require('@controllers/github');
const githubMiddleware = require('@middlewares/github');
const authMiddleware = require('@middlewares/authentication');

router.get('/authenticate/', githubMiddleware.authenticate);
router.get('/callback/', 
    githubMiddleware.authenticateCallback, 
    githubController.authCallback);

router.use(authMiddleware.protect);
router.post('/', githubController.createAccount);

router.use(authMiddleware.restrictTo('admin'));
router.route('/:id')
    .get(githubController.getAccount)
    .patch(githubController.updateAccount)
    .delete(githubController.deleteAccount);

router.route('/')
    .get(githubController.getAccounts);

module.exports = router;