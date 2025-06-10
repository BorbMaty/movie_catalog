const express = require('express'); // Express alkalmazás létrehozása
const router = express.Router(); // Útvonalak kezelése
const { requireLogin, requireAdmin } = require('../middleware/auth'); // Hitelesítési middleware-ek importálása



// Home route: list of movies
router.get('/',requireLogin, (req, res) => { // Home oldal, ahol a filmek listája jelenik meg
  const search = req.query.q || ''; // Always defined

  let sql = 'SELECT id, title_hu, cover_image FROM movies'; // Alap SQL lekérdezés a filmek listázására
  const params = []; // Paraméterek tömbje az SQL lekérdezéshez

  if (search) { // Ha van keresési feltétel
    sql += ' WHERE title_hu LIKE ? OR title_en LIKE ?'; // Keresési feltétel hozzáadása az SQL lekérdezéshez
    params.push(`%${search}%`, `%${search}%`); // Paraméterek hozzáadása a keresési feltételhez
  }

  req.db.query(sql, params, (err, results) => { // Adatbázis lekérdezés végrehajtása
    if (err) return res.status(500).send('DB hiba.'); // Hiba kezelése, ha az adatbázis lekérdezés sikertelen
    res.render('index', { movies: results, query: search }); // EJS sablon renderelése a lekérdezett filmekkel és a keresési feltétellel
  });
});


module.exports = router; // Filmek útvonalak kezelése

router.get('/movie/:id', (req, res) => { // Film részleteinek megjelenítése
  const movieId = req.params.id; // Film azonosítója az URL-ből

  const sql = ` 
    SELECT m.*, 
           GROUP_CONCAT(DISTINCT CONCAT(a.name, ' as ', mc.role_name) SEPARATOR ', ') AS cast_list,
           ROUND(AVG(rat.rating), 1) AS avg_rating
    FROM movies m
    LEFT JOIN movie_cast mc ON m.id = mc.movie_id
    LEFT JOIN actors a ON mc.actor_id = a.id
    LEFT JOIN ratings rat ON m.id = rat.movie_id
    WHERE m.id = ?
    GROUP BY m.id
  `;

  req.db.query(sql, [movieId], (err, movieResult) => { // Adatbázis lekérdezés a film részleteinek lekérésére
    if (err || movieResult.length === 0) return res.status(404).send('Film nem található.'); // Hiba kezelése, ha a film nem található vagy az adatbázis lekérdezés sikertelen

    const movie = movieResult[0]; // Az első találatot vesszük, mivel az ID egyedi

    const reviewSql = ` 
      SELECT u.name, r.text, r.created_at
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.movie_id = ?
    `;

    req.db.query(reviewSql, [movieId], (err, reviews) => { // Adatbázis lekérdezés a filmhez tartozó kritikák lekérésére
      if (err) return res.status(500).send('Hiba a kritikák lekérésekor.'); // Hiba kezelése, ha a kritikák lekérése sikertelen
      res.render('movie', { movie, reviews }); // EJS sablon renderelése a film részleteivel és a kritikákkal
    });
  });
});

router.get('/', (req, res) => { // Főoldal, ahol a filmek listája jelenik meg
  const search = req.query.q; // Keresési feltétel lekérése az URL-ből, ha van
  let sql = 'SELECT id, title_hu, cover_image FROM movies'; // Alap SQL lekérdezés a filmek listázására
  const params = []; // Paraméterek tömbje az SQL lekérdezéshez

  if (search) { // Ha van keresési feltétel
    sql += ' WHERE title_hu LIKE ? OR title_en LIKE ?'; // Keresési feltétel hozzáadása az SQL lekérdezéshez
    params.push(`%${search}%`, `%${search}%`); // Paraméterek hozzáadása a keresési feltételhez
  }

  req.db.query(sql, params, (err, results) => { // Adatbázis lekérdezés végrehajtása
    if (err) return res.status(500).send('DB hiba.'); // Hiba kezelése, ha az adatbázis lekérdezés sikertelen
    res.render('index', { movies: results, query: search || '' }); // EJS sablon renderelése a lekérdezett filmekkel és a keresési feltétellel
  });
});

router.post('/movie/:id/review', (req, res) => { // Kritika és értékelés hozzáadása egy filmhez
  const movieId = req.params.id; // Film azonosítója az URL-ből
  const userId = req.session.userId; // Bejelentkezett felhasználó azonosítója a session-ből
  const { text, rating } = req.body; // Kritika szövege és értékelés a POST kérés törzséből 
  const db = req.db; // Adatbázis kapcsolat elérése az útvonalban

  if (!userId) { // Ha a felhasználó nincs bejelentkezve
    return res.redirect('/login'); // Átirányítás a bejelentkezési oldalra
  }

  // Kritikát beszúrjuk
  db.query(
    'INSERT INTO reviews (user_id, movie_id, text) VALUES (?, ?, ?)', // Kritika beszúrása az adatbázisba
    [userId, movieId, text], 
    (err) => {
      if (err) return res.send('Hiba a kritika mentésekor.'); // Hiba kezelése, ha a kritika mentése sikertelen

      // Értékelést is beszúrjuk
      db.query(
        'INSERT INTO ratings (user_id, movie_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?', // Értékelés beszúrása vagy frissítése, ha már létezik
        [userId, movieId, rating, rating], // Értékelés beszúrása vagy frissítése
        (err2) => {
          if (err2) return res.send('Hiba az értékelés mentésekor.'); // Hiba kezelése, ha az értékelés mentése sikertelen
          res.redirect(`/movie/${movieId}`); // Sikeres mentés után átirányítás a film részletei oldalra
        }
      );
    }
  );
});


