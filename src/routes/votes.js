// src/routes/votes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST a vote
router.post('/', (req, res) => {
    const { candidate_id, user_id } = req.body;

    if (!candidate_id || !user_id) {
        return res.status(400).json({ error: 'Candidate ID and User ID are required' });
    }

    // Check if the candidate exists
    const checkCandidateSql = 'SELECT * FROM candidates WHERE id = ?';
    db.query(checkCandidateSql, [candidate_id], (err, results) => {
        if (err) {
            console.error('Error checking candidate:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        // Check if the user has already voted
        const checkUserSql = 'SELECT has_voted FROM users WHERE id = ?';
        db.query(checkUserSql, [user_id], (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (results[0].has_voted) {
                return res.status(400).json({ error: 'User has already voted' });
            }

            // Insert the vote
            const insertSql = 'INSERT INTO votes (candidate_id, user_id) VALUES (?, ?)';
            db.query(insertSql, [candidate_id, user_id], (err, result) => {
                if (err) {
                    console.error('Error recording vote:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                // Update the user's voting status
                const updateUserSql = 'UPDATE users SET has_voted = true WHERE id = ?';
                db.query(updateUserSql, [user_id], (err, result) => {
                    if (err) {
                        console.error('Error updating user voting status:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }

                    res.status(201).json({ message: 'Vote recorded successfully' });
                });
            });
        });
    });
});

// GET vote counts
router.get('/counts', (req, res) => {
    // SQL query to get vote counts per candidate
    const countSql = `
        SELECT c.id, c.name, COUNT(v.id) AS vote_count
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        GROUP BY c.id, c.name
        ORDER BY vote_count DESC
    `;

    db.query(countSql, (err, results) => {
        if (err) {
            console.error('Error fetching vote counts:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

// Admin route to view voting results
router.get('/admin/results', (req, res) => {
    const query = `
        SELECT c.id, c.name, COUNT(v.id) AS vote_count
        FROM candidates c
        LEFT JOIN votes v ON c.id = v.candidate_id
        GROUP BY c.id, c.name
        ORDER BY vote_count DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

module.exports = router;
