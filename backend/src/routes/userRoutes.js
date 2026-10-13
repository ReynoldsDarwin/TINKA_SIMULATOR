// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// RENIEC proxy
router.get('/reniec/:dni', userController.consultarReniec);

// CRUD participantes
router.get('/', userController.getAllUsers);
router.get('/dni/:dni', userController.getUserByDni);
router.post('/', userController.registerUser);
router.delete('/all', userController.clearAllUsers);
router.delete('/:id', userController.deleteUser);

module.exports = router;
