const express = require('express');
const router = express.Router();

// Base API URL
const apiUrl = 'https://plankton-app-2-9k8uf.ondigitalocean.app/api/activity_types';

// Accept mysqlConnection as a parameter and use it for database queries
module.exports = (mysqlConnection) => {
    
    // Fetch all categories (activity types) with hypermedia controls
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM activity_types';
        mysqlConnection.query(query, (err, rows) => {
            if (err) {
                console.error('Error fetching categories: ', err);
                res.status(500).send('Server error');
            } else {
                // Adding hypermedia links to each category
                const response = rows.map(row => ({
                    ...row,
                    _links: {
                        self: { href: `${apiUrl}/${row.type_id}` },
                        edit: { href: `${apiUrl}/${row.type_id}`, method: 'PUT' },
                        delete: { href: `${apiUrl}/${row.type_id}`, method: 'DELETE' }
                    }
                }));
                res.json(response);
            }
        });
    });

    // Fetch a specific category by ID with hypermedia controls
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM activity_types WHERE type_id = ?';
        const values = [req.params.id];
        mysqlConnection.query(query, values, (err, row) => {
            if (err) {
                console.error('Error fetching category: ', err);
                res.status(500).send('Server error');
            } else if (row.length === 0) {
                res.status(404).send('Category not found');
            } else {
                // Adding hypermedia links to the category
                const response = {
                    ...row[0],
                    _links: {
                        self: { href: `${apiUrl}/${row[0].type_id}` },
                        edit: { href: `${apiUrl}/${row[0].type_id}`, method: 'PUT' },
                        delete: { href: `${apiUrl}/${row[0].type_id}`, method: 'DELETE' }
                    }
                };
                res.json(response);
            }
        });
    });

    // Add a new category
    router.post('/', (req, res) => {
        const { type_name } = req.body;
        const query = `
            INSERT INTO activity_types (type_name)
            VALUES (?)
        `;
        const values = [type_name];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error adding category: ', err);
                res.status(500).send('Server error');
            } else {
                const newCategory = {
                    type_id: result.insertId,
                    type_name
                };

                // Adding hypermedia links to the new category
                res.status(201).json({
                    ...newCategory,
                    _links: {
                        self: { href: `${apiUrl}/${newCategory.type_id}` },
                        edit: { href: `${apiUrl}/${newCategory.type_id}`, method: 'PUT' },
                        delete: { href: `${apiUrl}/${newCategory.type_id}`, method: 'DELETE' }
                    }
                });
            }
        });
    });

    // Update an existing category by ID
    router.put('/:id', (req, res) => {
        const { type_name } = req.body;
        const query = `
            UPDATE activity_types
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
                const updatedCategory = {
                    type_id: req.params.id,
                    type_name
                };

                // Adding hypermedia links to the updated category
                res.json({
                    ...updatedCategory,
                    _links: {
                        self: { href: `${apiUrl}/${updatedCategory.type_id}` },
                        edit: { href: `${apiUrl}/${updatedCategory.type_id}`, method: 'PUT' },
                        delete: { href: `${apiUrl}/${updatedCategory.type_id}`, method: 'DELETE' }
                    }
                });
            }
        });
    });

    // Delete a category by ID
    router.delete('/:id', (req, res) => {
        const query = 'DELETE FROM activity_types WHERE type_id = ?';
        const values = [req.params.id];
        
        mysqlConnection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error deleting category: ', err);
                res.status(500).send('Server error');
            } else if (result.affectedRows === 0) {
                res.status(404).send('Category not found');
            } else {
                res.send({
                    message: 'Category deleted successfully',
                    _links: {
                        self: { href: `${apiUrl}/${req.params.id}` },
                        add: { href: `${apiUrl}`, method: 'POST' }
                    }
                });
            }
        });
    });

    return router;
};
