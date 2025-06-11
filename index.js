require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());

const db = mysql.createPool(
{
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
    });

db.getConnection((err, connection) =>
{
    if (err)
    {
        console.error('MySQL connection error:', err);
    }
    else
    {
        console.log('Connected to MySQL');
        connection.release();
    }
});

app.get('/', (req, res) =>
{
    res.send('Backend is running');
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) =>
    {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
});

app.post('/setup', (req, res) => {
    const { username, petName } = req.body;

    if (!username || !petName) {
        return res.status(400).json({ message: 'Missing username or pet name' });
    }

    const createUserQuery = 'INSERT INTO users (username) VALUES (?)';
    db.query(createUserQuery, [username], (err, userResult) =>
    {
        if (err)
        {
            return res.status(500).json({ message: 'Username already exists.' });
        }

        const userId = userResult.insertId;

        const createPetQuery = 'INSERT INTO pets (name, hap, hunger, health, user_id, last_seen) VALUES (?, 50, 50, 50, ?, NOW())';
        db.query(createPetQuery, [petName, userId], (err, petResult) =>
        {
            if (err) {
                console.error('Pet insert error:', err);
                return res.status(500).json({ message: 'Error creating pet' });
            }

            console.log('Inserted pet with ID:', petResult.insertId);

            db.query('SELECT * FROM pets WHERE id = ?', [petResult.insertId], (err, result) => {
                console.log('Inserted pet row:', result[0]);

                res.json({ userId, petId: petResult.insertId, username });
            });
        });
    });
});

app.get('/pet/:id', (req, res) =>
{
    const petId = req.params.id;

    db.query('SELECT * FROM pets WHERE id = ?', [petId], (err, results) =>
    {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('Pet not found');

        const pet = results[0];

        const lastSeen = new Date(pet.last_seen);
        const now = new Date();
        const diffDays = (now - lastSeen) / (1000 * 60 * 60 * 24);

        if (pet.health === 0 && diffDays >= 2) {
            return res.json({ ...pet, dead: true });
        }
        else if (diffDays >= .13) {
            let newHunger = Math.min(pet.hunger + 20 * diffDays, 100);
            let newHap = Math.max(pet.hap - 20 * diffDays, 0);


            let newHealth = Math.round((newHap + (100 - newHunger)) / 2);

            db.query(
                'UPDATE pets SET hunger = ?, hap = ?, health = ?, last_seen = NOW() WHERE id = ?',
                [newHunger, newHap, newHealth, petId],
                (updateErr) => {
                    if (updateErr) return res.status(500).send(updateErr);
                    res.json({
                        ...pet,
                        hunger: Math.round(newHunger),
                        hap: Math.round(newHap),
                        health: Math.round(newHealth),
                        last_seen: now,
                        dead: newHealth === 0 && diffDays >= 2
                    });
                }
            );
        }
        else
        {
            res.json({ ...pet, dead: pet.health === 0 && diffDays >= 2 });
        }
    });
});

app.post('/pet/feed', (req, res) =>
{
    const { id } = req.body;

    db.query('SELECT hunger, hap FROM pets WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) return res.status(500).send(err || 'Pet not found');

        let { hunger, hap } = results[0];
        hunger = Math.max(hunger - 10, 0);
        const health = Math.round((100 - hunger + hap) / 2);

        db.query(
            'UPDATE pets SET hunger = ?, health = ?, last_seen = NOW() WHERE id = ?',
            [hunger, health, id],
            (updateErr) => {
                if (updateErr) return res.status(500).send(updateErr);
                res.sendStatus(200);
            }
        );
    });
});

app.post('/pet/play', (req, res) =>
{
    const { id } = req.body;
    db.query('SELECT hunger, hap FROM pets WHERE id = ?', [id], (err, results) =>
    {
        if (err || results.length === 0) return res.status(500).send(err || 'Pet not found');

        let { hunger, hap } = results[0];
        hap = Math.min(hap + 10, 100);
        const health = Math.round((100 - hunger + hap) / 2);

        db.query(
            'UPDATE pets SET hap = ?, health = ?, last_seen = NOW() WHERE id = ?',
            [hap, health, id],
            (updateErr) => {
                if (updateErr) return res.status(500).send(updateErr);
                res.sendStatus(200);
            }
        );
    });
});

app.get('/test', (req, res) =>
{
    db.query('SELECT 1 + 1 AS result', (err, result) =>
    {
        if (err) {
            console.error('DB test failed:', err);
            return res.status(500).send('DB error');
        }
        res.send('DB is working: ' + result[0].result);
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});