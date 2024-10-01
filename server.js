const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session');
const app = express();
require('dotenv').config(); // Load environment variables

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const sessionSecret = process.env.SESSION_SECRET;

// Configure CORS middleware
const corsOptions = {
    origin: ['https://plankton-app-2-9k8uf.ondigitalocean.app', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json()); // Parse JSON bodies

// Set up express-session middleware
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        domain: '.plankton-app-2-9k8uf.ondigitalocean.app', // Set the cookie domain to your root domain
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Lax'
    }
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection
const db = mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Your existing API routes...
app.get('/participants', async (req, res) => {

    try {

        const [rows] = await pool.query('SELECT * FROM participants');

        res.json(rows);

    } catch (err) {

        console.error('Error fetching participants:', err);

        res.status(500).json({ error: 'Failed to fetch participants' });

    }

});


app.post('/participants', async (req, res) => {

    try {

        const { name, email } = req.body;

        const [result] = await pool.query('INSERT INTO participants (name, email) VALUES (?, ?)', [name, email]);

        const participantId = result.insertId;

        res.json({ participant_id: participantId });

    } catch (err) {

        console.error('Error adding participant:', err);

        res.status(500).json({ error: 'Failed to add participant' });

    }

});


app.put('/participants/:participantId', async (req, res) => {

    try {

        const participantId = req.params.id;

        const { name, email } = req.body;

        const [result] = await pool.query('UPDATE participants SET name = ?, email = ? WHERE id = ?', [name, email, participantId]);

        if (result.affectedRows === 0) {

            return res.status(404).json({ error: 'Participant not found' });

        }

        res.json({ message: 'Participant updated successfully' });

    } catch (err) {

        console.error('Error updating participant:', err);

        res.status(500).json({ error: 'Failed to update participant' });

    }

});


app.delete('/participants/:participantId', async (req, res) => {

    try {

        const participantId = req.params.id;

        const [result] = await pool.query('DELETE FROM participants WHERE id = ?', [participantId]);

        if (result.affectedRows === 0) {

            return res.status(404).json({ error: 'Participant not found' });

        }

        res.json({ message: 'Participant deleted successfully' });

    } catch (err) {

        console.error('Error deleting participant:', err);

        res.status(500).json({ error: 'Failed to delete participant' });

    }

});


// Start the server
const PORT = process.env.PORT || 5500 || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
