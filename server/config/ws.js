const { io } = require('@config/express');
const wsController = require('@controllers/wsController');

wsController(io);