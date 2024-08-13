const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Database configuration
const conn = mysql.createPool({
    host: 'localhost',
    user: 'mohammed',
    password: 'password',
    database: 'Gestion_De_Portefeuille'
});

// Test connection
conn.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
    connection.release();
});

// Get all users
app.get('/', (req, res) => {
    conn.query('SELECT * FROM user', (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ error: 'An error occurred' });
        }
        console.log('Query results:', results); 
        res.json(results);
    });
});

// Render registration page
app.get('/register', (req, res) => {
    res.render('register');
});

// Register new user
app.post('/register', (req, res) => {
    try {
        const { email, name, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);

        conn.query('INSERT INTO user (email, name, password) VALUES (?, ?, ?)', [email, name, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'An error occurred' });
            }
            console.log('User registered:', result);
            res.json({ message: 'User registered successfully' });
        });
    } catch(err) {
        console.error('Error in try-catch:', err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
