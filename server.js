const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const client = redis.createClient(); // Redis client
require('dotenv').config(); // Load environment variables

const app = express();

// Add logging for Redis connection and errors
client.on('connect', () => {
    console.log('Connected to Redis');
});
client.on('error', (err) => {
    console.error('Redis error:', err);
});

const sessionSecret = process.env.SESSION_SECRET;

// Configure CORS middleware before session
const corsOptions = {
    origin: ['https://plankton-app-2-9k8uf.ondigitalocean.app', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Set up express-session middleware
app.use(session({
    store: new RedisStore({ client }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }  // Secure in production with HTTPS
}));

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

// Use the participant routes for any API calls that start with /api/participants
app.use('/api/participants', participantRoutes(db));
console.log("Participant routes have been set up");

// Use the participant routes for any API calls that start with /api/notes
app.use('/api/notes', noteRoutes(db));
console.log("Note routes have been set up");

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
