const express = require('express');
const router = express.Router();

module.exports = (mysqlConnection) => { // Accept mysqlConnection as a parameter

    // Get all notes
    router.get('/', (req, res) => {
        console.log('Fetching all notes...');
        const query = 'SELECT * FROM notes';
        mysqlConnection.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    });

    // Get a specific note by ID
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM notes WHERE note_id = ?';
        mysqlConnection.query(query, [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).send('Note not found.');
            }
            res.json(results[0]);
        });
    });

    // Add a new note
    router.post('/', (req, res) => {
        const { note, follow_up, status, name } = req.body;
        const query = 'INSERT INTO notes (note, follow_up, status, name) VALUES (?, ?, ?, ?)';

        mysqlConnection.query(query, [note, follow_up, status, name], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            // Respond with the newly created note's ID and details
            res.status(201).json({ note_id: result.insertId, note, follow_up, status, name });
        });
    });

    // Update an existing note by ID
    router.put('/:id', (req, res) => {
        const { note, follow_up, status, name } = req.body;
        const query = 'UPDATE notes SET note = ?, follow_up = ?, status = ?, name = ? WHERE note_id = ?';

        mysqlConnection.query(query, [note, follow_up, status, name, req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Note not found.');
            }
            res.json({ message: 'Note updated successfully.', note_id: req.params.id, note, follow_up, status, name });
        });
    });

    // Delete a note by ID
    router.delete('/:id', (req, res) => {
        const query = 'DELETE FROM notes WHERE note_id = ?';
        mysqlConnection.query(query, [req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('Note not found.');
            }
            res.status(204).send(); // No content response for successful deletion
        });
    });

    return router;
};
