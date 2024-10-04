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
        console.log(req.params.id); // Log the ID being passed
        const participantId = parseInt(req.params.id, 10);
        
        if (isNaN(participantId)) {
        return res.status(400).json({ error: 'Invalid participant ID' });
        }

        const query = 'SELECT * FROM participants WHERE participant_id = ?';
        mysqlConnection.query(query, [participantId], (err, results) => {
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
                console.error('Error updating participant:', err); // Log the error
                return res.status(500).json({ error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Participant not found' });
            }
            res.json({ message: 'Participant updated successfully' });
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
