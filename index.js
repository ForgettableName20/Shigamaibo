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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

db.getConnection((err, connection) =>
{
    if (err) {
        console.error('MySQL connection error:', err);
    } else {
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
            //console.error('User insert error:', err);
            return res.status(500).json({ message: 'Username already exists.' });
        }

        const userId = userResult.insertId;

        const createPetQuery = 'INSERT INTO pets (name, hap, hunger, health, user_id) VALUES (?, 50, 50, 50, ?)';
        db.query(createPetQuery, [petName, userId], (err, petResult) =>
        {
            if (err) {
                console.error('Pet insert error:', err);
                return res.status(500).json({ message: 'Error creating pet' });
            }

            console.log('Inserted pet with ID:', petResult.insertId);

            db.query('SELECT * FROM pets WHERE id = ?', [petResult.insertId], (err, result) => {
                console.log('Inserted pet row:', result);

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

        if (pet.health === 0 && diffDays >= 2)
        {
            return res.json({ ...pet, dead: true });
        }
        else if (diffDays >= .5)
        {
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

//app.post('/pet/create', (req, res) =>
//{
//    const { name, userId } = req.body;
//    console.log('Received pet creation request:', { name, userId });

//    if (!name || !userId)
//    {
//        return res.status(400).json({ message: "Missing user ID or pet name" });
//    }

//    const checkName = 'SELECT * FROM pets WHERE name = ? AND user_id = ?';

//    db.query(checkName, [name, userId], (err, results) =>
//    {
//        if (err)
//        {
//            console.error(err);
//            return res.status(500).send('Database error');
//        }

//        if (results.length > 0)
//        {
//            return res.status(409).json({ message: "Pet name already exists" });
//        }

//        const insertName = 'INSERT INTO pets (name, hap, hunger, user_id) VALUES (?, 50, 50, ?)';
//        db.query(insertName, [name, userId], (err, result) =>
//        {
//            if (err) {
//                console.error(err);
//                return res.status(500).send(err);
//            }

//            res.json({ id: result.insertId });
//        });
//    });
//});

app.post('/pet/feed', (req, res) =>
{
    const { id } = req.body;
    db.query('UPDATE pets SET hunger = GREATEST(hunger - 10, 0), health = (100 - hunger + hap) / 2, last_seen = NOW() WHERE id = ?', [id], (err) =>
    {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});

app.post('/pet/play', (req, res) =>
{
    const { id } = req.body;
    db.query('UPDATE pets SET hap = LEAST(hap + 10, 100), health = (100 - hunger + hap) / 2, last_seen = NOW() WHERE id = ?', [id], (err) =>
    {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
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

app.listen(3000, () =>
{
    console.log('Server is running on http://localhost:3000');
});