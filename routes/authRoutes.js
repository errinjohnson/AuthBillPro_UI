const express = require('express');
const router = express.Router();

// Accept mysqlConnection as a parameter and use it for database queries
module.exports = (mysqlConnection) => {

    // Get all authorizations
    router.get('/api/authorizations', (req, res) => {
        const query = 'SELECT * FROM Authorizations';
        mysqlConnection.query(query, (error, results) => {
            if (error) return res.status(500).json({ error });
            res.json(results);
        });
    });

    // Get single authorization by auth_number
    router.get('/api/authorizations/:auth_number', (req, res) => {
        const query = 'SELECT * FROM Authorizations WHERE auth_number = ?';
        mysqlConnection.query(query, [req.params.auth_number], (error, results) => {
            if (error) return res.status(500).json({ error });
            res.json(results[0]);
        });
    });

    // Add new authorization
    router.post('/api/authorizations', (req, res) => {
        const { auth_number, auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours } = req.body;
        const query = `
            INSERT INTO Authorizations (auth_number, auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        mysqlConnection.query(query, [auth_number, auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours], (error, results) => {
            if (error) return res.status(500).json({ error });
            res.status(201).json({ message: 'Authorization added successfully' });
        });
    });

    // Update authorization
    router.put('/api/authorizations/:auth_number', (req, res) => {
        const { auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours } = req.body;
        const query = `
            UPDATE Authorizations SET auth_begin_date = ?, auth_end_date = ?, auth_rate = ?, auth_billable_hours = ?, auth_remaining_billable_hours = ?
            WHERE auth_number = ?
        `;
        mysqlConnection.query(query, [auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours, req.params.auth_number], (error, results) => {
            if (error) return res.status(500).json({ error });
            res.json({ message: 'Authorization updated successfully' });
        });
    });

    return router;
};



