const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const saltRounds = 10;

// REGISZTRÁCIÓ – űrlap megjelenítése
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// REGISZTRÁCIÓ – adat fogadása
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const db = req.db;

  // Ellenőrizzük, létezik-e már a felhasználó
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.send('DB hiba');
    if (results.length > 0) {
      return res.render('register', { error: 'Ez az email már foglalt.' });
    }

    // Jelszó hashelése
    const hashed = await bcrypt.hash(password, saltRounds);

    // Mentés adatbázisba
    db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashed, name], (err2) => {
      if (err2) return res.send('Hiba a mentéskor.');
      res.redirect('/login');
    });
  });
});

module.exports = router;

// BEJELENTKEZÉS – űrlap megjelenítése
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// BEJELENTKEZÉS – adat fogadása
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.render('login', { error: 'Hibás email vagy jelszó.' });
    }

    const user = results[0];
    const match = await require('bcrypt').compare(password, user.password);

    if (!match) {
      return res.render('login', { error: 'Hibás email vagy jelszó.' });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.role = user.role; 
    res.redirect('/');
  });
});

// KIJELENTKEZÉS
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Hiba a kijelentkezéskor.');
    res.redirect('/');
  });
});