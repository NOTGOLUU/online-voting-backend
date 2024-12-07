// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Import the MySQL connection

const router = express.Router();

// User Registration Route
router.post('/register', (req, res) => {
    console.log('Register route hit'); // Log to check if the route is reached
    const { username, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: err.message });

        // Check if the username already exists
        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        db.query(checkQuery, [username], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length > 0) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Insert new user into the database
            const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(query, [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return res.status(500).send('Error registering user');
                }
                res.status(200).json({ message: 'User registered successfully!' });
            });
        });
    });
});

// User Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username }); // Log the login attempt

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Database error:', err); // Log the error
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            console.log('User not found'); // Log if user is not found
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];
        console.log('User found:', { username: user.username }); // Log found user

        // Compare passwords
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing passwords:', err); // Log comparison error
                return res.status(500).json({ error: err.message });
            }
            if (!isMatch) {
                console.log('Incorrect password'); // Log incorrect password attempt
                return res.status(400).json({ message: 'Incorrect password' });
            }

            // Generate a token for authentication
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secretKey'); // Use environment variable for secret
            res.status(200).json({ message: 'Login successful', token });
        });
    });
});

module.exports = router;
