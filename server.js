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

app.get('/api/participants', (req, res) => {
    console.log('Fetching participants...');
    const query = 'SELECT * FROM participants';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(results); // Check query results
        res.json(results);
    });
});



app.post('/api/participants', (req, res) => {
    const { email, first_name, last_name, phone, registration } = req.body;
    const query = 'INSERT INTO participants (email, first_name, last_name, phone, registration) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [email, first_name, last_name, phone, registration], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ message: 'Participant added', participant_id: results.insertId });
    });
});


app.put('/api/participants/:id', (req, res) => {
    const { email, first_name, last_name, phone, registration } = req.body;
    const query = 'UPDATE participants SET email = ?, first_name = ?, last_name = ?, phone = ?, registration = ? WHERE participant_id = ?';
    db.query(query, [email, first_name, last_name, phone, registration, req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Participant updated' });
    });
});


app.delete('/api/participants/:id', (req, res) => {
    const query = 'DELETE FROM participants WHERE participant_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Participant deleted' });
    });
});



// Start the server
const PORT = process.env.PORT || 5500 || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
