const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();

const corsOptions = {
    origin: ['https://plankton-app-2-9k8uf.ondigitalocean.app', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

console.log("Session middleware has been initialized");

// Built-in middleware
app.use(express.json()); // Parse JSON bodies

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
console.log("Serving static files from public directory");

// Load routes
const participantRoutes = require('./routes/participantRoutes');
const noteRoutes = require("./routes/noteRoutes");
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const vrRoutes = require('./routes/vrRoutes');

// Use the participant routes for any API calls that start with /api/participants
app.use('/api/participants', participantRoutes(db));
console.log("Participant routes have been set up");

// Use the notes routes for any API calls that start with /api/notes
app.use('/api/notes', noteRoutes(db));
console.log("Note routes have been set up");

// Use the authorization routes for any API calls that start with /api/auth
app.use('/api/auth', authRoutes(db));
console.log("Auth routes have been set up");

// Use the authorization routes for any API calls that start with /api/auth
app.use('/api/vr_offices', vrRoutes(db));
console.log("vr_offices routes have been set up");

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
