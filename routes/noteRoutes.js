const express = require('express');
const router = express.Router();

module.exports = (mysqlConnection) => {
    // Helper function to generate hypermedia links for a note
    const generateHypermediaLinks = (note_id) => {
        return {
            self: { href: `https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes/${note_id}` },
            edit: { href: `https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes/${note_id}`, method: 'PUT' },
            delete: { href: `https://plankton-app-2-9k8uf.ondigitalocean.app/api/notes/${note_id}`, method: 'DELETE' }
        };
    };

    // Get all notes with hypermedia controls
    router.get('/', (req, res) => {
        const query = 'SELECT * FROM notes';
        mysqlConnection.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Add hypermedia links to each note
            const notesWithLinks = results.map(note => ({
                ...note,
                _links: generateHypermediaLinks(note.note_id)
            }));
            
            res.json(notesWithLinks);
        });
    });

    // Get a specific note by ID with hypermedia controls
    router.get('/:id', (req, res) => {
        const query = 'SELECT * FROM notes WHERE note_id = ?';
        mysqlConnection.query(query, [req.params.id], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).send('Note not found.');
            }
            
            // Add hypermedia links to the note
            const noteWithLinks = {
                ...results[0],
                _links: generateHypermediaLinks(results[0].note_id)
            };
            
            res.json(noteWithLinks);
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
            
            const newNote = {
                note_id: result.insertId,
                note,
                follow_up,
                status,
                name,
                _links: generateHypermediaLinks(result.insertId)
            };

            res.status(201).json(newNote);
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
            
            // Return the updated note with hypermedia controls
            res.json({
                message: 'Note updated successfully.',
                note_id: req.params.id,
                note,
                follow_up,
                status,
                name,
                _links: generateHypermediaLinks(req.params.id)
            });
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
