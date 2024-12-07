// src/routes/candidates.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all candidates
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM candidates';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching candidates:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// (Optional) POST a new candidate
router.post('/', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }
    const sql = 'INSERT INTO candidates (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
        if (err) {
            console.error('Error adding candidate:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Candidate added', candidateId: result.insertId });
    });
});

module.exports = router;
