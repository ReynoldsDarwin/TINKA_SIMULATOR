// backend/src/controllers/gameController.js
const LCG = require('../engine/rng');
const MonteCarloSimulator = require('../engine/montecarlo');
const db = require('../config/database');

// GET /api/game/draw - Genera un sorteo simple usando el LCG
exports.drawTinka = (req, res) => {
    try {
        const rng = new LCG(Date.now());
        const draw = rng.drawUnique(6, 53);
        
        res.status(200).json({
            success: true,
            message: "Sorteo generado con éxito",
            data: draw
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/game/simulate - Ejecuta la simulación de Montecarlo para UN ticket
exports.simulateTinka = (req, res) => {
    try {
        const { ticket, nSimulations = 1000000 } = req.body;

        if (!ticket || !Array.isArray(ticket) || ticket.length !== 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Debes enviar un arreglo 'ticket' con exactamente 6 números." 
            });
        }

        const n = Math.min(Math.max(parseInt(nSimulations) || 1000000, 1000), 5000000);
        const simulator = new MonteCarloSimulator(Date.now());
        const results = simulator.simulateTinka(ticket, n, 53, 6);

        // Calcular probabilidades empíricas
        const probabilities = {};
        for (let i = 0; i <= 6; i++) {
            probabilities[i] = ((results[i] / n) * 100).toFixed(4);
        }

        res.status(200).json({
            success: true,
            simulations: n,
            ticket_played: ticket,
            results: results,
            probabilities: probabilities
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/game/simulate-all - Simula Monte Carlo para TODOS los participantes registrados
exports.simulateAll = (req, res) => {
    try {
        const { nSimulations = 1000000 } = req.body;
        const n = Math.min(Math.max(parseInt(nSimulations) || 1000000, 1000), 5000000);

        // Obtener todos los participantes
        const users = db.prepare('SELECT * FROM users').all();
        if (users.length === 0) {
            return res.status(200).json({
                success: true,
                simulations: n,
                participants: []
            });
        }

        // Usar la misma semilla para comparación justa entre participantes
        const seed = Date.now();
        const results = users.map(user => {
            const ticket = [user.n1, user.n2, user.n3, user.n4, user.n5, user.n6];
            const simulator = new MonteCarloSimulator(seed);
            const simResult = simulator.simulateTinka(ticket, n, 53, 6);

            // Probabilidad de ganar (al menos 3 aciertos)
            const wins3Plus = (simResult[3] || 0) + (simResult[4] || 0) + (simResult[5] || 0) + (simResult[6] || 0);
            const probWin = ((wins3Plus / n) * 100);
            const prob6 = ((simResult[6] / n) * 100);

            return {
                id: user.id,
                nombres: user.nombres,
                apellidos: user.apellidos,
                dni: user.dni,
                ticket,
                resultados: simResult,
                probabilidadPremio: probWin.toFixed(4),
                probabilidadPozo: prob6.toFixed(6),
                totalPremios: wins3Plus
            };
        });

        // Ordenar por probabilidad de premio descendente
        results.sort((a, b) => parseFloat(b.probabilidadPremio) - parseFloat(a.probabilidadPremio));

        res.status(200).json({
            success: true,
            simulations: n,
            participants: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};