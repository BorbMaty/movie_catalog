const express = require('express'); // Express alkalmazás létrehozása
const router = express.Router(); // Útvonalak kezelése
const bcrypt = require('bcrypt'); // Jelszó hasheléshez szükséges könyvtár

const saltRounds = 10; // Jelszó hasheléshez szükséges sókörök száma

// REGISZTRÁCIÓ – űrlap megjelenítése
router.get('/register', (req, res) => { // Regisztrációs űrlap megjelenítése
  res.render('register', { error: null }); // EJS sablon renderelése, hiba nélkül
});

// REGISZTRÁCIÓ – adat fogadása
router.post('/register', async (req, res) => { // Regisztrációs adatok fogadása
  const { name, email, password } = req.body; // Regisztrációs űrlapból kapott adatok
  const db = req.db; // Adatbázis kapcsolat elérése az útvonalban

  // Ellenőrizzük, létezik-e már a felhasználó
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => { // Adatbázis lekérdezés a felhasználó email címének ellenőrzésére
    if (err) return res.send('DB hiba'); // Hiba kezelése az adatbázis lekérdezés során
    if (results.length > 0) { // Ha van már ilyen email című felhasználó
      return res.render('register', { error: 'Ez az email már foglalt.' }); // Hibaüzenet visszaküldése a regisztrációs űrlapra
    }

    // Jelszó hashelése
    const hashed = await bcrypt.hash(password, saltRounds); // Jelszó hashelése bcrypt segítségével

    // Mentés adatbázisba
    db.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashed, name], (err2) => { // Adatbázisba mentés
      if (err2) return res.send('Hiba a mentéskor.'); // Hiba kezelése a mentés során
      res.redirect('/login'); // Sikeres regisztráció után átirányítás a bejelentkezési oldalra
    });
  });
});

module.exports = router; // Auth útvonalak kezelése

// BEJELENTKEZÉS – űrlap megjelenítése
router.get('/login', (req, res) => { //
  res.render('login', { error: null }); // EJS sablon renderelése, hiba nélkül
});

// BEJELENTKEZÉS – adat fogadása
router.post('/login', (req, res) => {
  const { email, password } = req.body; // Bejelentkezési űrlapból kapott adatok
  const db = req.db; // Adatbázis kapcsolat elérése az útvonalban

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {// Adatbázis lekérdezés a felhasználó email címének ellenőrzésére
    if (err || results.length === 0) { // Ha hiba történt vagy nincs ilyen email című felhasználó
      return res.render('login', { error: 'Hibás email vagy jelszó.' }); // Hibaüzenet visszaküldése a bejelentkezési űrlapra
    }

    const user = results[0]; // Az első találatot vesszük, mivel az email cím egyedi
    const match = await require('bcrypt').compare(password, user.password); // Jelszó ellenőrzése a hashelt jelszóval

    if (!match) { // Ha a jelszó nem egyezik
      return res.render('login', { error: 'Hibás email vagy jelszó.' }); // Hibaüzenet visszaküldése a bejelentkezési űrlapra
    }

    req.session.userId = user.id; // Session-ben tároljuk a felhasználó azonosítóját
    req.session.userName = user.name; // Session-ben tároljuk a felhasználó nevét
    req.session.role = user.role;  // Session-ben tároljuk a felhasználó szerepét (pl. admin)
    res.redirect('/'); // Sikeres bejelentkezés után átirányítás a főoldalra
  });
});

// KIJELENTKEZÉS
router.get('/logout', (req, res) => { // Kijelentkezés kezelése
  req.session.destroy(err => { // Session törlése
    if (err) return res.send('Hiba a kijelentkezéskor.'); // Hiba kezelése a session törlése során
    res.redirect('/'); // Átirányítás a főoldalra kijelentkezés után
  });
});