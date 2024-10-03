// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const app = express();

const participantRoutes = require('./routes/participantRoutes');
const db = require('./db');
require('dotenv').config(); // Load environment variables
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
console.log("Session middleware has been initialized");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
console.log("Serving static files from public directory");

// Use the participant routes for any API calls that start with /api/participants
app.use('/api/participants', participantRoutes(db));
console.log("Participant routes have been set up");

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
