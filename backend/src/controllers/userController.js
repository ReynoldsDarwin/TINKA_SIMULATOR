// backend/src/controllers/userController.js
const db = require('../config/database');
const axios = require('axios');
const api = process.env.RENIEC_API;

// GET /api/users - Obtener todos los participantes registrados
exports.getAllUsers = (req, res) => {
    try {
        const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/users/dni/:dni - Verificar si un DNI ya está registrado
exports.getUserByDni = (req, res) => {
    try {
        const { dni } = req.params;
        const user = db.prepare('SELECT * FROM users WHERE dni = ?').get(dni);
        if (!user) {
            return res.status(404).json({ success: false, message: 'DNI no registrado' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/users - Registrar un participante
exports.registerUser = (req, res) => {
    try {
        const { nombres, apellidos, dni, numeros } = req.body;

        // Validaciones
        if (!dni || dni.length !== 8 || !/^\d{8}$/.test(dni)) {
            return res.status(400).json({ success: false, message: 'DNI inválido. Debe tener 8 dígitos.' });
        }
        if (!numeros || !Array.isArray(numeros) || numeros.length !== 6) {
            return res.status(400).json({ success: false, message: 'Debes proporcionar exactamente 6 números.' });
        }
        const validNums = numeros.every(n => Number.isInteger(n) && n >= 1 && n <= 53);
        if (!validNums) {
            return res.status(400).json({ success: false, message: 'Los números deben estar entre 1 y 53.' });
        }
        const uniqueNums = new Set(numeros);
        if (uniqueNums.size !== 6) {
            return res.status(400).json({ success: false, message: 'Los 6 números deben ser diferentes.' });
        }

        // Verificar si el DNI ya existe
        const existing = db.prepare('SELECT id FROM users WHERE dni = ?').get(dni);
        if (existing) {
            return res.status(409).json({ success: false, message: 'Este DNI ya está registrado.' });
        }

        const sorted = [...numeros].sort((a, b) => a - b);

        const result = db.prepare(`
            INSERT INTO users (nombres, apellidos, dni, n1, n2, n3, n4, n5, n6)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(nombres || '', apellidos || '', dni, sorted[0], sorted[1], sorted[2], sorted[3], sorted[4], sorted[5]);

        const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ success: true, message: 'Participante registrado con éxito.', data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/all - Limpiar TODA la tabla
exports.clearAllUsers = (req, res) => {
    try {
        db.prepare('DELETE FROM users').run();
        // Reiniciar el autoincrement
        try { db.prepare("DELETE FROM sqlite_sequence WHERE name='users'").run(); } catch (_) {}
        res.status(200).json({ success: true, message: 'Tabla de participantes limpiada correctamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/users/:id - Eliminar participante
exports.deleteUser = (req, res) => {
    try {
        const { id } = req.params;
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Participante no encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Participante eliminado.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/reniec/:dni - Proxy a API de decolecta para obtener datos del DNI
exports.consultarReniec = async (req, res) => {
    try {
        const { dni } = req.params;
        if (!dni || !/^\d{8}$/.test(dni)) {
            return res.status(400).json({ success: false, message: 'DNI inválido.' });
        }

        const response = await axios.get(
          `https://api.apis.net.pe/v2/reniec/dni?numero=${dni}`,
          {
            headers: {
              Authorization: "Bearer " + api,
              Accept: "application/json",
            },
            timeout: 10000,
          },
        );

        const data = response.data;
        res.status(200).json({
            success: true,
            data: {
                nombres: data.nombres || '',
                apellidoPaterno: data.apellidoPaterno || '',
                apellidoMaterno: data.apellidoMaterno || '',
                dni: data.numeroDocumento || dni
            }
        });
    } catch (error) {
        if (error.response?.status === 404) {
            return res.status(404).json({ success: false, message: 'DNI no encontrado en RENIEC.' });
        }
        // Fallback: intentar con decolecta
        try {
            const response2 = await axios.get(
              `https://api.perudevs.com/api/v1/dniruc/complete?document=${dni}&token=` + api,
              {
                timeout: 8000,
              },
            );
            const d = response2.data;
            if (d && d.data) {
                return res.status(200).json({
                    success: true,
                    data: {
                        nombres: d.data.nombres || d.data.name || '',
                        apellidoPaterno: d.data.apellidoPaterno || d.data.lastname || '',
                        apellidoMaterno: d.data.apellidoMaterno || '',
                        dni: dni
                    }
                });
            }
        } catch (_) {}
        res.status(500).json({ success: false, message: 'No se pudo consultar RENIEC. Intente de nuevo o ingrese los datos manualmente.' });
    }
};
