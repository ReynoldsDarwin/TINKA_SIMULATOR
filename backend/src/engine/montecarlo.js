// backend/src/engine/montecarlo.js
const LCG = require('./rng');

class MonteCarloSimulator {
    constructor(seed = Date.now()) {
        // Inicializa el Generador Congruencial Lineal (LCG) con la semilla dada[cite: 18]
        this.rng = new LCG(seed);
    }
    /**
     * Simula N sorteos de La Tinka para ver el rendimiento de un ticket.
     * @param {Array} ticket - Arreglo con los 6 números jugados (1 al 53).
     * @param {number} nSimulations - Cantidad de sorteos a simular (ej. 1000000).
     * @param {number} totalBalls - Bolillas en el bombo (Actualizado a 53).
     * @param {number} drawSize - Bolillas a extraer (6).
     */
    simulateTinka(ticket, nSimulations = 1000000, totalBalls = 53, drawSize = 6) {
        // Objeto para contar cuántas veces tuvimos 0, 1, 2, 3, 4, 5 o 6 aciertos
        const hitsCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        
        for (let i = 0; i < nSimulations; i++) {
            // Genera una combinación pseudoaleatoria basada en LCG y Uniforme Discreta[cite: 4, 18]
            const draw = this.rng.drawUnique(drawSize, totalBalls);
            const hits = this.countHits(ticket, draw);
            hitsCount[hits]++;
        }

        return hitsCount;
    }

    /**
     * Compara el ticket del usuario con el sorteo ganador.
     */
    countHits(ticket, draw) {
        return ticket.filter(num => draw.includes(num)).length;
    }
}

// Bloque de prueba para ejecutar directamente en consola
if (require.main === module) {
    console.log("=== PRUEBA DE MONTE CARLO - LA TINKA (53 NÚMEROS) ===");
    
    // Fijamos la semilla en 42 para que los resultados sean reproducibles en tu exposición[cite: 10, 21]
    const simulator = new MonteCarloSimulator(42);
    
    // Jugada de 6 números (rango del 1 al 53)
    const miJugada = [5, 12, 23, 34, 41, 53];
    const N = 1000000; // 1 Millón de simulaciones

    console.log(`Jugada elegida: [${miJugada.join(', ')}]`);
    console.log(`Simulando ${N} sorteos. Por favor espera (esto tomará unos segundos)...`);
    
    const inicio = Date.now();
    const resultados = simulator.simulateTinka(miJugada, N, 53, 6);
    const fin = Date.now();

    console.log(`\nSimulación completada en ${fin - inicio} ms.`);
    console.log("Distribución empírica de aciertos:", resultados);
    
    // Cálculos estadísticos para mostrar al docente
    const probPozoEmpirica = (resultados[6] / N) * 100;
    
    // Matemática pura: Combinatoria de 53 en 6 = 53! / (6! * (53-6)!) = 22,957,480
    const combinacionesTotales = 22957480; 
    const probPozoTeorica = (1 / combinacionesTotales) * 100;

    console.log(`\n--- ANÁLISIS ESTADÍSTICO DEL POZO MILLONARIO ---`);
    console.log(`Probabilidad Teórica Matemática : ${probPozoTeorica.toFixed(8)}%`);
    console.log(`Probabilidad Empírica (Monte Carlo): ${probPozoEmpirica.toFixed(8)}%`);
    
    if (resultados[6] === 0) {
        console.log("\n Nota para la exposición: En 1 millón de simulaciones hubo 0 aciertos del pozo.");
        console.log("Esto demuestra perfectamente la Ley de los Grandes Números: para eventos con probabilidad de 1 en ~23 millones, necesitaríamos simular cientos de millones de sorteos para que la probabilidad empírica converja a la teórica.");
    }
}

module.exports = MonteCarloSimulator;