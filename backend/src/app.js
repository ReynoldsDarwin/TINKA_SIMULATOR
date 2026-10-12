const express = require('express');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();

// Middlewares
app.use(cors()); // Permite conexiones desde el Frontend (React)
app.use(express.json()); // Permite recibir JSON en el body (req.body)

// Montar las rutas
app.use('/api/game', gameRoutes);

module.exports = app;