const LCG = require('../engine/rng');
const MonteCarloSimulator = require('../engine/montecarlo');

// GET: Genera un sorteo simple usando el LCG
exports.drawTinka = (req, res) => {
    try {
        // Usamos Date.now() como semilla dinámica para sorteos reales
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

// POST: Ejecuta la simulación de Montecarlo
exports.simulateTinka = (req, res) => {
    try {
        const { ticket, nSimulations = 100000 } = req.body;

        if (!ticket || !Array.isArray(ticket) || ticket.length !== 6) {
            return res.status(400).json({ 
                success: false, 
                message: "Debes enviar un arreglo 'ticket' con exactamente 6 números." 
            });
        }

        const simulator = new MonteCarloSimulator(Date.now());
        const results = simulator.simulateTinka(ticket, nSimulations, 53, 6);

        res.status(200).json({
            success: true,
            simulations: nSimulations,
            ticket_played: ticket,
            results: results
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};