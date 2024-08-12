const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
    res.render('index');
})



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});