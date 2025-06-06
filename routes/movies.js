const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');



// Home route: list of movies
router.get('/',requireLogin, (req, res) => {
  const search = req.query.q || ''; // Always defined

  let sql = 'SELECT id, title_hu, cover_image FROM movies';
  const params = [];

  if (search) {
    sql += ' WHERE title_hu LIKE ? OR title_en LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  req.db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send('DB hiba.');
    res.render('index', { movies: results, query: search });
  });
});


module.exports = router;

router.get('/movie/:id', (req, res) => {
  const movieId = req.params.id;

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

  req.db.query(sql, [movieId], (err, movieResult) => {
    if (err || movieResult.length === 0) return res.status(404).send('Film nem található.');

    const movie = movieResult[0];

    const reviewSql = `
      SELECT u.name, r.text, r.created_at
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.movie_id = ?
    `;

    req.db.query(reviewSql, [movieId], (err, reviews) => {
      if (err) return res.status(500).send('Hiba a kritikák lekérésekor.');
      res.render('movie', { movie, reviews });
    });
  });
});

router.get('/', (req, res) => {
  const search = req.query.q;
  let sql = 'SELECT id, title_hu, cover_image FROM movies';
  const params = [];

  if (search) {
    sql += ' WHERE title_hu LIKE ? OR title_en LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  req.db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send('DB hiba.');
    res.render('index', { movies: results, query: search || '' });
  });
});

router.post('/movie/:id/review', (req, res) => {
  const movieId = req.params.id;
  const userId = req.session.userId;
  const { text, rating } = req.body;
  const db = req.db;

  if (!userId) {
    return res.redirect('/login');
  }

  // Kritikát beszúrjuk
  db.query(
    'INSERT INTO reviews (user_id, movie_id, text) VALUES (?, ?, ?)',
    [userId, movieId, text],
    (err) => {
      if (err) return res.send('Hiba a kritika mentésekor.');

      // Értékelést is beszúrjuk
      db.query(
        'INSERT INTO ratings (user_id, movie_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?',
        [userId, movieId, rating, rating],
        (err2) => {
          if (err2) return res.send('Hiba az értékelés mentésekor.');
          res.redirect(`/movie/${movieId}`);
        }
      );
    }
  );
});


