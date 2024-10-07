const express = require('express');
const router = express.Router();

// Accept mysqlConnection as a parameter and use it for database queries
module.exports = (mysqlConnection) => {

    // Get all authorizations
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM auth';
        mysqlConnection.query(query, (error, results) => {
            if (error) return res.status(500).json({ error });
            res.json(results);
        });
    });

    // Get single authorization by auth_number
    router.get('/:auth_number', (req, res) => {
        const query = 'SELECT * FROM Authorizations WHERE auth_number = ?';
        mysqlConnection.query(query, [req.params.auth_number], (error, results) => {
            if (error) return res.status(500).json({ error });
            res.json(results[0]);
        });
    });

    // Add new authorization
    router.post('/', (req, res) => {
        const { auth_number, auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours } = req.body;
        const query = `
            INSERT INTO auth (auth_number, auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        mysqlConnection.query(query, [auth_number, auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours], (error, results) => {
            if (error) return res.status(500).json({ error });
            res.status(201).json({ message: 'Authorization added successfully' });
        });
    });

    // Update authorization
    router.put('/:auth_number', (req, res) => {
        const { auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours } = req.body;
        const query = `
            UPDATE auth SET auth_begin_date = ?, auth_end_date = ?, auth_rate = ?, auth_billable_hours = ?, auth_remaining_billable_hours = ?
            WHERE auth_number = ?
        `;
        mysqlConnection.query(query, [auth_begin_date, auth_end_date, auth_rate, auth_billable_hours, auth_remaining_billable_hours, req.params.auth_number], (error, results) => {
            if (error) return res.status(500).json({ error });
            res.json({ message: 'Authorization updated successfully' });
        });
    });

    return router;
};



