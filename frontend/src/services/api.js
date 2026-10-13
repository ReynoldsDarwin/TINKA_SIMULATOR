// frontend/src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const GAME_URL = `${API_BASE}/game`;
const USERS_URL = `${API_BASE}/users`;

// ==================== GAME ====================

export const drawTinka = async () => {
    const response = await axios.get(`${GAME_URL}/draw`);
    return response.data;
};

export const simulateTinka = async (ticket, nSimulations = 1000000) => {
    const response = await axios.post(`${GAME_URL}/simulate`, { ticket, nSimulations });
    return response.data;
};

export const simulateAll = async (nSimulations = 1000000) => {
    const response = await axios.post(`${GAME_URL}/simulate-all`, { nSimulations });
    return response.data;
};

// ==================== USERS ====================

export const getAllUsers = async () => {
    const response = await axios.get(USERS_URL);
    return response.data;
};

export const getUserByDni = async (dni) => {
    const response = await axios.get(`${USERS_URL}/dni/${dni}`);
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await axios.post(USERS_URL, userData);
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await axios.delete(`${USERS_URL}/${id}`);
    return response.data;
};

export const clearAllUsers = async () => {
    const response = await axios.delete(`${USERS_URL}/all`);
    return response.data;
};

// ==================== RENIEC ====================

export const consultarReniec = async (dni) => {
    const response = await axios.get(`${USERS_URL}/reniec/${dni}`);
    return response.data;
};