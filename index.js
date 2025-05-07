require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

app.get('/', (req, res) => {
    res.send('Tamagotchi backend is running!');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});