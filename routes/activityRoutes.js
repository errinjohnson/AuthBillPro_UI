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

    // Fetch all participants
    router.get('/participants', (req, res) => {
        const query = 'SELECT participant_id, participant_name FROM participants';
        mysqlConnection.query(query, (err, rows) => {
            if (err) {
                console.error('Error fetching participants: ', err);
                res.status(500).send('Server error');
            } else {
                res.json(rows);
            }
        });
    });

    // Fetch authorizations for a specific participant
    router.get('/authorizations/participant/:participant_id', (req, res) => {
        const query = 'SELECT auth_number FROM auth WHERE participant_id = ?';
        const values = [req.params.participant_id];
        mysqlConnection.query(query, values, (err, rows) => {
            if (err) {
                console.error('Error fetching authorizations: ', err);
                res.status(500).send('Server error');
            } else if (rows.length === 0) {
                res.status(404).send('No authorizations found for the participant');
            } else {
                res.json(rows);
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
                // Update the auth_remaining_billable_hours in auth table
                const updateAuthQuery = `
                    UPDATE auth 
                    SET auth_remaining_billable_hours = auth_remaining_billable_hours - ?
                    WHERE auth_number = ?
                `;
                const updateValues = [actBillable_hours, auth_number];
                
                mysqlConnection.query(updateAuthQuery, updateValues, (err) => {
                    if (err) {
                        console.error('Error updating remaining billable hours:', err);
                        res.status(500).send('Server error');
                    } else {
                        res.status(201).send('Activity added successfully');
                    }
                });
            }
        });
    });

    // Update an existing activity by ID
    router.put('/:id', (req, res) => {
        const { activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number } = req.body;
        
        // Fetch existing actBillable_hours to adjust remaining hours correctly
        const getActivityQuery = 'SELECT actBillable_hours FROM activities WHERE activity_id = ?';
        mysqlConnection.query(getActivityQuery, [req.params.id], (err, result) => {
            if (err) {
                console.error('Error fetching activity for billable hours:', err);
                res.status(500).send('Server error');
            } else if (result.length === 0) {
                res.status(404).send('Activity not found');
            } else {
                const oldBillableHours = result[0].actBillable_hours;

                // Update the activity
                const updateActivityQuery = `
                    UPDATE activities
                    SET activity_date = ?, actType_name = ?, participant_id = ?, actCase_notes = ?, actBillable_hours = ?, auth_number = ?
                    WHERE activity_id = ?
                `;
                const values = [activity_date, actType_name, participant_id, actCase_notes, actBillable_hours, auth_number, req.params.id];
                
                mysqlConnection.query(updateActivityQuery, values, (err, updateResult) => {
                    if (err) {
                        console.error('Error updating activity:', err);
                        res.status(500).send('Server error');
                    } else if (updateResult.affectedRows === 0) {
                        res.status(404).send('Activity not found');
                    } else {
                        // Adjust remaining hours in auth table
                        const hourDifference = actBillable_hours - oldBillableHours;
                        const updateAuthQuery = `
                            UPDATE auth 
                            SET auth_remaining_billable_hours = auth_remaining_billable_hours - ?
                            WHERE auth_number = ?
                        `;
                        mysqlConnection.query(updateAuthQuery, [hourDifference, auth_number], (err) => {
                            if (err) {
                                console.error('Error updating remaining billable hours:', err);
                                res.status(500).send('Server error');
                            } else {
                                res.send('Activity updated successfully');
                            }
                        });
                    }
                });
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
