const express = require('express');
const router = express.Router();
const webhookController = require('@controllers/webhook');

router.post('/:repositoryId/', webhookController.webhook);

module.exports = router;