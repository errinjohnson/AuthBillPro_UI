const express = require('express');
const router = express.Router();

// Accept mysqlConnection as a parameter
module.exports = (mysqlConnection) => {
    
    // Get all offices
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM vr_offices';
        mysqlConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to retrieve offices.' });
            }
            res.json(results);
        });
    });

    // Get a single office by office_id
    router.get('/:office_id', (req, res) => {
        const query = 'SELECT * FROM vr_offices WHERE office_id = ?';
        mysqlConnection.query(query, [req.params.office_id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to retrieve office.' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Office not found.' });
            }
            res.json(results[0]);
        });
    });

    // Create a new office
    router.post('/', (req, res) => {
        const { office_name, office_email, contact_first_name, contact_last_name, contact_phone_number } = req.body;
        const query = 'INSERT INTO vr_offices (office_name, office_email, contact_first_name, contact_last_name, contact_phone_number) VALUES (?, ?, ?, ?, ?)';
        
        mysqlConnection.query(query, [office_name, office_email, contact_first_name, contact_last_name, contact_phone_number], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to create office.' });
            }
            res.status(201).json({ message: 'Office created successfully', officeId: results.insertId });
        });
    });

    // Update an existing office by office_id
    router.put('/:office_id', (req, res) => {
        const { office_name, office_email, contact_first_name, contact_last_name, contact_phone_number } = req.body;
        const query = 'UPDATE vr_offices SET office_name = ?, office_email = ?, contact_first_name = ?, contact_last_name = ?, contact_phone_number = ? WHERE office_id = ?';
        
        mysqlConnection.query(query, [office_name, office_email, contact_first_name, contact_last_name, contact_phone_number, req.params.office_id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to update office.' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Office not found.' });
            }
            res.json({ message: 'Office updated successfully.' });
        });
    });

    // Delete an office by office_id
    router.delete('/:office_id', (req, res) => {
        const query = 'DELETE FROM vr_offices WHERE office_id = ?';
        
        mysqlConnection.query(query, [req.params.office_id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to delete office.' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Office not found.' });
            }
            res.json({ message: 'Office deleted successfully.' });
        });
    });

    return router;
};
