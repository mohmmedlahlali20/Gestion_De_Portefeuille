const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const session = require('express-session');
const secretKey = crypto.randomBytes(32).toString('hex');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
}));

const conn = mysql.createPool({
    host: 'localhost',
    user: 'mohammed',
    password: 'password',
    database: 'Gestion_De_Portefeuille'
});

conn.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
    connection.release();
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    next();
});

app.get('/', isAuthenticated, (req, res) => {
    conn.query('SELECT * FROM user', (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ error: 'An error occurred' });
        }
        res.render('index', { users: results });
    });
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: res.locals.errorMessage });
});

app.post('/register', (req, res) => {
    try {
        const { email, name, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);

        conn.query('INSERT INTO user (email, name, password) VALUES (?,?,?)', [email, name, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                req.session.errorMessage = 'An error occurred during registration.';
                return res.redirect('/register');
            }
            console.log('User registered:', result);
            res.redirect('/');
        });
    } catch (err) {
        req.session.errorMessage = 'An error occurred during registration.';
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: res.locals.errorMessage });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    conn.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            req.session.errorMessage = 'An error occurred during login.';
            return res.redirect('/login');
        }

        if (results.length === 0) {
            req.session.errorMessage = 'Invalid email or password.';
            return res.redirect('/login');
        }

        const user = results[0];

        if (bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            console.log('User authenticated:', user);
            res.redirect('/');
        } else {
            req.session.errorMessage = 'Invalid email or password.';
            res.redirect('/login');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
