// frontend/src/services/api.js
import axios from 'axios';

// La URL donde está corriendo tu backend
const API_URL = 'http://localhost:3000/api/game';

export const drawTinka = async () => {
    try {
        const response = await axios.get(`${API_URL}/draw`);
        return response.data;
    } catch (error) {
        console.error("Error al obtener el sorteo:", error);
        throw error;
    }
};

export const simulateTinka = async (ticket, nSimulations = 100000) => {
    try {
        const response = await axios.post(`${API_URL}/simulate`, { 
            ticket, 
            nSimulations 
        });
        return response.data;
    } catch (error) {
        console.error("Error en la simulación:", error);
        throw error;
    }
};