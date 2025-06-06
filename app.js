const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const movieRoutes = require('./routes/movies');

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Session setup
app.use(session({
  secret: 'MalterosLapát',
  resave: false,
  saveUninitialized: false
}));

// Make session available to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Make DB available on req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Routes (order matters!)
app.use(authRoutes);
app.use(adminRoutes);
app.use('/', movieRoutes);

// Start server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
