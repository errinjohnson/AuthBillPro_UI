// Load environment variables
require('dotenv').config();

const mysql = require('mysql2');

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

let mysqlConnection;

// Function to handle reconnection
function handleDisconnect() {
    mysqlConnection = mysql.createConnection({
        host: dbHost,
        user: dbUser,
        password: dbPassword,
        database: dbName
    });

    // Connect to MySQL
    mysqlConnection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
        } else {
            console.log('Connected to the database.');
        }
    });

    // Log connection errors or events
    mysqlConnection.on('error', function(err) {
        console.error('Database error event:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Connection lost. Attempting to reconnect...');
            handleDisconnect(); // Reconnect on connection loss
        } else {
            throw err;
        }
    });
}

// Call the function to handle connection and reconnection
handleDisconnect();

module.exports = mysqlConnection; // Export the database connection object
