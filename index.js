require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createPool(
{
    host: "maglev.proxy.rlwy.net",
    user: "root",
    password: "toyMPaXGatxDvOeCzwVARtzbunqWBnPx",
    database: "MySQL_Tamagotchi"
});

db.getConnection((err, connection) => {
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

app.get('/pet/:id', (req, res) => {
    const petId = req.params.id;
    db.query('SELECT * FROM pets WHERE id = ?', [petId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results[0]);
    });
});

app.post('/pet/create', (req, res) =>
{
    const { name } = req.body;
    const sql = 'INSERT INTO pets (name, hap, hunger) VALUES (?, 50, 50)';
    db.query(sql, [name], (err, result) => {
        if (err)
        {
            console.error(err);
            return res.status(500).send(err);
        }

        res.json({ id: result.insertId });
    });
});

app.post('/pet/feed', (req, res) => {
    const { id } = req.body;
    db.query('UPDATE pets SET hunger = GREATEST(hunger - 10, 0) WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});

app.post('/pet/play', (req, res) => {
    const { id } = req.body;
    db.query('UPDATE pets SET hap = LEAST(hap + 10, 100) WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});

app.get('/test', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, result) => {
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