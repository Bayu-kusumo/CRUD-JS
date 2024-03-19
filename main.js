//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error',(error)=>{
    console.log(error)
});
db.once('open', ()=>{
    console.log('Connected to the database')
})

//midlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: false,
    resave: false,
}));

app.use((req,res,next) =>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Display image
app.use(express.static('uploads'));

//set template engine
app.set('view engine', 'ejs');

//router(digunakan untuk mengakses halaman page)
app.use("", require('./routes/routes.js'));

app.listen(PORT, ()=>{
    console.log(`Server is now running at port ${PORT}`);
})