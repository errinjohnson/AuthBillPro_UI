const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables
const fs = require('fs');
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
// ----------------------------------------------------------------------------
// Load routes
const db = require('./db'); // Ensure the db connection is loaded before using it
const participantRoutes = require('./routes/participantRoutes');
const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require('./routes/authRoutes');
const vrRoutes = require('./routes/vrRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const activityRoutes = require('./routes/activityRoutes');
// ------------------------------------------------------------------------------
// Use the participant routes for any API calls that start with /api/participants
app.use('/api/participants', participantRoutes(db));
console.log("Participant routes have been set up");

// Use the notes routes for any API calls that start with /api/notes
app.use('/api/notes', noteRoutes(db));
console.log("Note routes have been set up");

// Use the authorization routes for any API calls that start with /api/auth
app.use('/api/auth', authRoutes(db));
console.log("Auth routes have been set up");

// Use the vr offices routes for any API calls that start with /api/vr_offices
app.use('/api/vr_offices', vrRoutes(db));
console.log("vr_offices routes have been set up");

// Use the category routes for any API calls that start with /api/activity_types
app.use('/api/activity_types', categoryRoutes(db));
console.log("category routes have been set up");

// Use the activity routes for any API calls that start with /api/activities
app.use('/api/activities', activityRoutes(db));
console.log("activity routes have been set up");

// Use the activity routes for any API calls that start with /api/activities
app.use('/api/authorizations', authRoutes(db)); 
console.log("auth routes for activities have been set up");
// --------------------------------------------------------------

// Function to log uptime
function logUptime() {
    const uptime = process.uptime(); // Get system uptime in seconds
    const uptimeInHours = (uptime / 3600).toFixed(2); // Convert uptime to hours
    const logMessage = `System Uptime: ${uptimeInHours} hours\n`;

    // Append the uptime log to a file
    fs.appendFile('uptime.log', logMessage, (err) => {
        if (err) throw err;
        console.log('Uptime logged:', logMessage.trim());
    });
}

// Set interval to log uptime every hour (3600 seconds)
setInterval(logUptime, 3600 * 1000);

// Log uptime immediately on startup
logUptime();
// -----------------------------------------------------------------

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
