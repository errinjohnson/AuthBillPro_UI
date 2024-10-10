const express = require('express');
const router = express.Router();

// Base API URL for hypermedia controls
const apiUrl = 'https://plankton-app-2-9k8uf.ondigitalocean.app/api/auth';

// Accept mysqlConnection as a parameter and use it for database queries
module.exports = (mysqlConnection) => {

    // Function to generate hypermedia links for each authorization
    const generateHypermediaLinks = (auth_number) => {
        return {
            self: { href: `${apiUrl}/${auth_number}` },
            edit: { href: `${apiUrl}/${auth_number}`, method: 'PUT' },
            delete: { href: `${apiUrl}/${auth_number}`, method: 'DELETE' }
        };
    };

    // Get all authorizations with hypermedia controls
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM auth';
        mysqlConnection.query(query, (error, results) => {
            if (error) return res.status(500).json({ error });
            
            // Add hypermedia links to each authorization
            const response = results.map(auth => ({
                ...auth,
                _links: generateHypermediaLinks(auth.auth_number)
            }));

            res.json(response);
        });
    });

    // Get single authorization by auth_number with hypermedia controls
    router.get('/:auth_number', (req, res) => {
        const query = 'SELECT * FROM auth WHERE auth_number = ?';
        mysqlConnection.query(query, [req.params.auth_number], (error, results) => {
            if (error) return res.status(500).json({ error });
            if (results.length === 0) return res.status(404).json({ message: 'Authorization not found' });

            // Add hypermedia links to the authorization
            const response = {
                ...results[0],
                _links: generateHypermediaLinks(req.params.auth_number)
            };

            res.json(response);
        });
    });

    // Add new authorization
    router.post('/', (req, res) => {
        const {
            auth_number, auth_begin_date, auth_end_date, auth_rate,
            auth_billable_hours, auth_remaining_billable_hours, participant_id,
            office_id, office_name, office_email, contact_first_name,
            contact_last_name, contact_phone_number
        } = req.body;

        const query = `
            INSERT INTO auth (
                auth_number, auth_begin_date, auth_end_date, auth_rate,
                auth_billable_hours, auth_remaining_billable_hours, participant_id,
                office_id, office_name, office_email, contact_first_name,
                contact_last_name, contact_phone_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        mysqlConnection.query(query, [
            auth_number, auth_begin_date, auth_end_date, auth_rate,
            auth_billable_hours, auth_remaining_billable_hours, participant_id,
            office_id, office_name, office_email, contact_first_name,
            contact_last_name, contact_phone_number
        ], (error, results) => {
            if (error) return res.status(500).json({ error });

            // Return the created resource with hypermedia controls
            res.status(201).json({
                message: 'Authorization added successfully',
                auth_number,
                _links: generateHypermediaLinks(auth_number)
            });
        });
    });

    // Update authorization with hypermedia controls
    router.put('/:auth_number', (req, res) => {
        const {
            auth_begin_date, auth_end_date, auth_rate,
            auth_billable_hours, auth_remaining_billable_hours, participant_id,
            office_id, office_name, office_email, contact_first_name,
            contact_last_name, contact_phone_number
        } = req.body;

        const query = `
            UPDATE auth SET
                auth_begin_date = ?, auth_end_date = ?, auth_rate = ?,
                auth_billable_hours = ?, auth_remaining_billable_hours = ?, participant_id = ?,
                office_id = ?, office_name = ?, office_email = ?, contact_first_name = ?,
                contact_last_name = ?, contact_phone_number = ?
            WHERE auth_number = ?
        `;

        mysqlConnection.query(query, [
            auth_begin_date, auth_end_date, auth_rate,
            auth_billable_hours, auth_remaining_billable_hours, participant_id,
            office_id, office_name, office_email, contact_first_name,
            contact_last_name, contact_phone_number, req.params.auth_number
        ], (error, results) => {
            if (error) return res.status(500).json({ error });
            if (results.affectedRows === 0) return res.status(404).json({ message: 'Authorization not found' });

            // Return success message with hypermedia controls
            res.json({
                message: 'Authorization updated successfully',
                auth_number: req.params.auth_number,
                _links: generateHypermediaLinks(req.params.auth_number)
            });
        });
    });

    return router;
};
