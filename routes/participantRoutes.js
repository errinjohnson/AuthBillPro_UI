// routes/participantRoutes.js

const express = require('express');
const router = express.Router();

module.exports = (mysqlConnection) => { // Accept mysqlConnection as a parameter

    // GET /api/participants
    router.get('/', (req, res) => {
        console.log('Fetching participants...');
        const query = 'SELECT * FROM participants';
        mysqlConnection.query(query, (err, results) => { // Use mysqlConnection instead of db
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    });
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM participants WHERE participant_id = ?';
        mysqlConnection.query(query, [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Participant not found' });
            }
            res.json(results[0]);
        });
    });
    
    // POST /api/participants
    router.post('/', (req, res) => {
        const { email, first_name, last_name, phone, registration } = req.body;
        const query = 'INSERT INTO participants (email, first_name, last_name, phone, registration) VALUES (?, ?, ?, ?, ?)';
        mysqlConnection.query(query, [email, first_name, last_name, phone, registration], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Participant added', participant_id: results.insertId });
        });
    });

    // PUT /api/participants/:id
    router.put('/:id', (req, res) => {
        const { email, first_name, last_name, phone, registration } = req.body;
        const query = 'UPDATE participants SET email = ?, first_name = ?, last_name = ?, phone = ?, registration = ? WHERE participant_id = ?';
        mysqlConnection.query(query, [email, first_name, last_name, phone, registration, req.params.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Participant updated' });
        });
    });

    // DELETE /api/participants/:id
    router.delete('/:id', (req, res) => {
        const query = 'DELETE FROM participants WHERE participant_id = ?';
        mysqlConnection.query(query, [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Participant deleted' });
        });
    });

    return router; // Return the configured router
};
