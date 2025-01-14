const express = require('express');
const router = express.Router();

module.exports = (mysqlConnection) => {
    // Fetch all invoices
    router.get('/', (req, res) => {
        const query = `
            SELECT 
                activities.activity_id, 
                activities.activity_date, 
                activities.actType_name, 
                activities.actBillable_hours, 
                auth.auth_rate, 
                CONCAT(participants.first_name, ' ', participants.last_name) AS participant_name 
            FROM 
                activities 
            JOIN 
                auth ON activities.auth_number = auth.auth_number 
            JOIN 
                participants ON activities.participant_id = participants.participant_id
        `;
        mysqlConnection.query(query, (err, rows) => {
            if (err) {
                console.error('Error fetching invoices:', err);
                res.status(500).json({ error: 'Failed to fetch invoices' });
            } else {
                res.json(rows);
            }
        });
    });

    // Fetch invoices for a specific participant
    router.get('/participant/:participant_id', (req, res) => {
        const query = `
            SELECT 
                activities.activity_id, 
                activities.activity_date, 
                activities.actType_name, 
                activities.actBillable_hours, 
                auth.auth_rate, 
                CONCAT(participants.first_name, ' ', participants.last_name) AS participant_name 
            FROM 
                activities 
            JOIN 
                auth ON activities.auth_number = auth.auth_number 
            JOIN 
                participants ON activities.participant_id = participants.participant_id 
            WHERE 
                participants.participant_id = ?
        `;
        const values = [req.params.participant_id];
        mysqlConnection.query(query, values, (err, rows) => {
            if (err) {
                console.error('Error fetching invoices for participant:', err);
                res.status(500).json({ error: 'Failed to fetch invoices' });
            } else if (rows.length === 0) {
                res.status(404).json({ message: 'No invoices found for this participant' });
            } else {
                res.json(rows);
            }
        });
    });

    return router;
};
