const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const methodOverride = require('method-override');
const Database = require('./database');
const UserService = require('./UserService');
const CategoryService = require('./CategoryService');
const TransactionService = require('./TransactionService');
const app = express();
const port = 3000;
const secretKey = crypto.randomBytes(32).toString('hex');

const db = new Database({
    host: 'localhost',
    user: 'mohammed',
    password: 'password',
    database: 'Gestion_De_Portefeuille'
});

const userService = new UserService(db);
const categoryService = new CategoryService(db);
const transactionService = new TransactionService(db);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.errorMessage = req.session.errorMessage;
    delete req.session.errorMessage;
    next();
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user; 
        return next();
    }
    res.redirect('/login');
}

// Routes non protégées
app.get('/register', (req, res) => {
    res.render('register', { errorMessage: res.locals.errorMessage });
});
app.post('/register', async (req, res) => {
    try {
        const { email, name, password } = req.body;
        await userService.registerUser(email, name, password);
        res.redirect('/');
    } catch (err) {
        req.session.errorMessage = 'An error occurred during registration.';
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: res.locals.errorMessage });
});
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.authenticateUser(email, password);
        req.session.user = user;
        res.redirect('/');
    } catch (err) {
        req.session.errorMessage = 'Invalid email or password.';
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

// Routes
app.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id; 
        const [transactions, categories] = await Promise.all([
            transactionService.getTransactionsByUserId(userId),
            categoryService.getAllCategories()
        ]);
        res.render('index', { Transaction: transactions, categories: categories });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/category', isAuthenticated, async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.render('category', { categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.render('category', { errorMessage: 'An error occurred while fetching categories.' });
    }
});

app.post('/category', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        await categoryService.createCategory(name);
        res.redirect('/category');
    } catch (err) {
        console.error('Error creating category:', err);
        req.session.errorMessage = 'An error occurred during category creation.';
        res.redirect('/category');
    }
});

app.get('/category/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.render('editCategory', { category });
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/category/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await categoryService.updateCategory(id, name);
        res.redirect('/category');
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/category/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Error deleting category:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/transaction', isAuthenticated, async (req, res) => {
    try {
        const [transactions, users, categories] = await Promise.all([
            transactionService.getTransactionsByUserId(),
            userService.getAllUsers(),
            categoryService.getAllCategories() 
        ]);
        res.render('transaction', { transactions, users, categories });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/transaction', isAuthenticated, async (req, res) => {
    try {
        const { category_id, amount, type, date, user_id } = req.body;
        await transactionService.createTransaction(category_id, amount, type, date, user_id);
        res.redirect('/transaction');
    } catch (error) {
        console.error('Error creating transaction:', error.message);
        res.status(400).send('Error creating transaction');
    }
});

app.put('/transaction/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, montant, category_id } = req.body;
        await transactionService.updateTransaction(id, type, montant, category_id);
        res.redirect('/');
    } catch (err) {
        console.error('Error updating transaction:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/transaction/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        await transactionService.deleteTransaction(id);
        res.redirect('/'); 
    } catch (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
