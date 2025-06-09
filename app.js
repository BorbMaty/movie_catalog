const express = require('express'); // Express alkalmazás létrehozása
const mysql = require('mysql2'); // MySQL adatbázis kapcsolat létrehozása
const dotenv = require('dotenv'); // Környezeti változók betöltése
const path = require('path'); // Fájlok elérési útjának kezelése
const session = require('express-session'); // Session kezelés Express-ben

const authRoutes = require('./routes/auth'); // Hitelesítési útvonalak
const adminRoutes = require('./routes/admin'); // Adminisztrátori útvonalak
const movieRoutes = require('./routes/movies'); // Film útvonalak

dotenv.config(); // Környezeti változók betöltése .env fájlból

const app = express(); // Express alkalmazás inicializálása
app.set('view engine', 'ejs'); // EJS sablonmotor beállítása
app.use(express.static(path.join(__dirname, 'public'))); // Statikus fájlok elérési útjának beállítása
app.use(express.urlencoded({ extended: true })); // URL kódolt adatok feldolgozása

// MySQL pool
const db = mysql.createPool({ // MySQL adatbázis kapcsolat létrehozása pool segítségével
  host: process.env.DB_HOST, // adatbázis hoszt
  user: process.env.DB_USER, // adatbázis felhasználó
  password: process.env.DB_PASSWORD, // adatbázis jelszó
  database: process.env.DB_NAME // adatbázis név
});

// Session kezelés
app.use(session({  // Session middleware beállítása
  secret: 'MalterosLapát', //jelszó a session titkosításához
  resave: false, // ne mentse újra a session-t, ha nem változott
  saveUninitialized: false // ne hozzon létre üres session-t
}));

// Middleware a session elérhetőségének biztosítására a template-ekben
app.use((req, res, next) => { //adjon hozzá egy middleware-t, ami elérhetővé teszi a session-t a template-ekben
  res.locals.session = req.session; // session elérhetőségének biztosítása a template-ekben
  next(); // folytatás a következő middleware-re
});

// Middleware a db elérhetőségének biztosítására az útvonalakban
app.use((req, res, next) => {
  req.db = db; // db elérhetőségének biztosítása az útvonalakban
  next(); // folytatás a következő middleware-re
});

// Útvonalak beállítása
app.use(authRoutes); // Hitelesítési útvonalak
app.use(adminRoutes); // Adminisztrátori útvonalak
app.use('/', movieRoutes); // Film útvonalak

// Szerver indítása
app.listen(3000, () => { // szerver indítása a 3000-es porton
  console.log('Server running at http://localhost:3000'); // szerver elérhetőségének kiírása a konzolra
});
