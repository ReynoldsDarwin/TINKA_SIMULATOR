// backend/src/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Rutas de la API
router.get('/draw', gameController.drawTinka);
router.post('/simulate', gameController.simulateTinka);
router.post('/simulate-all', gameController.simulateAll);

module.exports = router;