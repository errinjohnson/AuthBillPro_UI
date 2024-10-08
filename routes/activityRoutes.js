const express = require('express');
const router = express.Router();

// Accept mysqlConnection as a parameter and use it for database queries
module.exports = (mysqlConnection) => {

    // Fetch all activities
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM activities';
        mysqlConnection.query(query, (err, rows) => {
            if (err) {
                console.error('Error fetching activities: ', err);
                res.status(500).send('Server error');
            } else {
                res.json(rows);
            }
        });
    });

    // Fetch a specific activity by ID
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM activities WHERE activity_id = ?';
        const values = [req.params.id];
        mysqlConnection.query(query, values, (err, row) => {
            if (err) {
                console.error('Error fetching activity: ', err);
                res.status(500).send('Server error');
            } else if (row.length === 0) {
                res.status(404).send('Activity not found');
            } else {
                res.json(row[0]);
            }
        });
    });

    // Add a new activity
    router.post('/', (req, res) => {
        const { activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number } = req.body;
        const query = `
            INSERT INTO activities (activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error adding activity: ', err);
                res.status(500).send('Server error');
            } else {
                res.status(201).send('Activity added successfully');
            }
        });
    });

    // Update an existing activity by ID
    router.put('/:id', (req, res) => {
        const { activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number } = req.body;
        const query = `
            UPDATE activities
            SET activity_date = ?, actType_name = ?, participant_id = ?, actCase_notes = ?, actBillable_hours = ?, auth_number = ?
            WHERE activity_id = ?
        `;
        const values = [activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number, req.params.id];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating activity: ', err);
                res.status(500).send('Server error');
            } else if (result.affectedRows === 0) {
                res.status(404).send('Activity not found');
            } else {
                res.send('Activity updated successfully');
            }
        });
    });

    // Delete an activity by ID
    router.delete('/:id', (req, res) => {
        const query = 'DELETE FROM activities WHERE activity_id = ?';
        const values = [req.params.id];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error deleting activity: ', err);
                res.status(500).send('Server error');
            } else if (result.affectedRows === 0) {
                res.status(404).send('Activity not found');
            } else {
                res.send('Activity deleted successfully');
            }
        });
    });

    return router;
};
