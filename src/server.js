// src/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
require('./db');
// Load environment variables

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

// // Create connection to MySQL using environment variables
// const db = mysql.createConnection({
//     host: process.env.DB_HOST,      // Host from .env file
//     user: process.env.DB_USER,      // User from .env file
//     password: process.env.DB_PASSWORD,// Password from .env file
//     database: process.env.DB_NAME    // Database name from .env file
// });

// // Connect to the database
// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.message);
//         process.exit(1); // Exit the application if connection fails
//     } else {
//         console.log('Connected to the MySQL database');
//     }
// });

// Import Routes
const authRoute = require('./routes/auth');
const candidatesRoute = require('./routes/candidates');
const votesRoute = require('./routes/votes');

// Use Routes
app.use('/api/auth', authRoute);      // Authentication routes
app.use('/api/candidates', candidatesRoute); // Candidates routes
app.use('/api/votes', votesRoute);    // Votes routes

// Root Route
app.get('/', (req, res) => {
    res.send('Online Voting System Backend');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
