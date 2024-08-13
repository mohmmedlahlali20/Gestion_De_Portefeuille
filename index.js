const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const methodOverride = require('method-override');

const session = require('express-session');
const secretKey = crypto.randomBytes(32).toString('hex');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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
    conn.query('SELECT * FROM User', (err, results) => {
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

        conn.query('INSERT INTO User (email, name, password) VALUES (?,?,?)', [email, name, hashedPassword], (err, result) => {
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

    conn.query('SELECT * FROM User WHERE email = ?', [email], (err, results) => {
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

//category routes
app.get('/category', isAuthenticated, (req, res) => {
    conn.query('SELECT * FROM Category', (err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.render('category', { errorMessage: 'An error occurred while fetching categories.' });
        }
        res.render('category', { categories }); 
    });
});

//create new category
app.post('/category', isAuthenticated, (req, res) => {
    const { name } = req.body;

    conn.query('INSERT INTO Category (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.error('Error registering user:', err);
            req.session.errorMessage = 'An error occurred during registration.';
            return res.redirect('/category');
        }
        console.log('Category registered:', result);
        res.redirect('/category');
    });
});                                                                                                                     

//edit category
app.get('/category/:id/edit', isAuthenticated, (req, res) => {
    const { id } = req.params;

    conn.query('SELECT * FROM Category WHERE id =?', [id], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ error: 'An error occurred' });
        }
        res.render('edit_category', { category: result[0] });
    });
});

app.put('/category/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    conn.query('UPDATE Category SET name =? WHERE id =?', [name, id], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'An error occurred' });
        }
        console.log('Category updated:', result);
        res.redirect('/category');
    });
});

//delete category
app.delete('/category/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;

    conn.query('DELETE FROM Category WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'An error occurred' });
        }
        console.log('Category deleted:', result);
        res.status(200).json({ message: 'Category deleted successfully' });
    });
});




// transaction routs


app.get('/transaction', isAuthenticated, (req, res) => {
    res.render('transaction');
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});