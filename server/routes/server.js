const express = require('express');
const router = express.Router();
const serverController = require('@controllers/server');

router.get('/health', serverController.health);

module.exports = router;