const express = require('express');
const router = express.Router();

// Accept mysqlConnection as a parameter and use it for database queries
module.exports = (mysqlConnection) => {
    
    // Fetch all categories (activity types)
    router.get('/activity_types', (req, res) => {
        const query = 'SELECT * FROM categories';
        mysqlConnection.query(query, (err, rows) => {
            if (err) {
                console.error('Error fetching categories: ', err);
                res.status(500).send('Server error');
            } else {
                res.json(rows);
            }
        });
    });

    // Fetch a specific category by ID
    router.get('/activity_types/:id', (req, res) => {
        const query = 'SELECT * FROM categories WHERE type_id = ?';
        const values = [req.params.id];
        mysqlConnection.query(query, values, (err, row) => {
            if (err) {
                console.error('Error fetching category: ', err);
                res.status(500).send('Server error');
            } else if (row.length === 0) {
                res.status(404).send('Category not found');
            } else {
                res.json(row[0]);
            }
        });
    });

    // Add a new category
    router.post('/activity_types', (req, res) => {
        const { type_name } = req.body;
        const query = `
            INSERT INTO categories (type_name)
            VALUES (?)
        `;
        const values = [type_name];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error adding category: ', err);
                res.status(500).send('Server error');
            } else {
                res.status(201).send({ type_id: result.insertId, type_name });
            }
        });
    });

    // Update an existing category by ID
    router.put('/activity_types/:id', (req, res) => {
        const { type_name } = req.body;
        const query = `
            UPDATE categories
            SET type_name = ?
            WHERE type_id = ?
        `;
        const values = [type_name, req.params.id];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating category: ', err);
                res.status(500).send('Server error');
            } else if (result.affectedRows === 0) {
                res.status(404).send('Category not found');
            } else {
                res.send('Category updated successfully');
            }
        });
    });

    // Delete a category by ID
    router.delete('/activity_types/:id', (req, res) => {
        const query = 'DELETE FROM categories WHERE type_id = ?';
        const values = [req.params.id];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error deleting category: ', err);
                res.status(500).send('Server error');
            } else if (result.affectedRows === 0) {
                res.status(404).send('Category not found');
            } else {
                res.send('Category deleted successfully');
            }
        });
    });

    return router;
};
