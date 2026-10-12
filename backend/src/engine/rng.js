// backend/src/engine/rng.js

class LCG {
    /**
     * Generador Congruencial Lineal (LCG)
     * Parámetros basados estrictamente en la clase de Simulación de Números Pseudoaleatorios.
     * a = 1664525, c = 1013904223, m = 2^32[cite: 18].
     */
    constructor(seed = 42) {
        this.m = Math.pow(2, 32); // Módulo[cite: 18]
        this.a = 1664525;         // Multiplicador[cite: 18]
        this.c = 1013904223;      // Incremento[cite: 18]
        this.x = seed;            // Semilla inicial[cite: 18]
    }

    /**
     * Genera un número pseudoaleatorio U en el intervalo [0, 1)
     * U_n = X_n / m
     */
    next() {
        // Fórmula del LCG: x_{n+1} = (a * x_n + c) mod m[cite: 14]
        this.x = (this.a * this.x + this.c) % this.m;
        return this.x / this.m;
    }

    /**
     * Genera una Distribución Uniforme Discreta entre 1 y n.
     * Fórmula: X = floor(n * U) + 1[cite: 4]
     */
    nextDiscreteUniform(n) {
        const u = this.next();
        return Math.floor(n * u) + 1; // Simple escalamiento y truncamiento de U(0,1)
    }

    /**
     * Extrae una cantidad 'k' de números únicos de un total de 'n' posibles.
     * Actualizado a los valores por defecto de la Tinka moderna: 6 bolillas de 53.
     */
    drawUnique(k = 6, n = 53) {
        // Validación de seguridad para el motor del juego
        if (k > n) {
            throw new Error("Error en el motor: No puedes extraer más bolillas de las disponibles.");
        }
        
        const draw = new Set();
        while (draw.size < k) {
            draw.add(this.nextDiscreteUniform(n));
        }
        // Retornamos el arreglo ordenado de menor a mayor
        return Array.from(draw).sort((a, b) => a - b);
    }
}

// Bloque de prueba para ejecutar directamente en consola
if (require.main === module) {
    console.log("=== PRUEBA DEL GENERADOR LCG ===");
    
    // Inicializamos con la semilla del ejemplo de clase[cite: 20]
    const rng = new LCG(42); 
    
    console.log("Los primeros 5 números pseudoaleatorios en [0, 1):");
    for (let i = 0; i < 5; i++) {
        // Mostramos el resultado con 8 decimales al igual que la diapositiva[cite: 20]
        console.log(`Número ${i + 1}: ${rng.next().toFixed(8)}`);
    }

    console.log("\nSorteo de La Tinka (6 números de 53):");
    // Ahora por defecto utilizará k=6 y n=53
    console.log(rng.drawUnique());
}

module.exports = LCG;