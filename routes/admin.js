const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');

// ADMIN PANEL MEGJELENÍTÉSE
router.get('/admin', requireLogin, requireAdmin, (req, res) => {
  req.db.query(
    `SELECT r.id AS review_id, r.text, r.user_id, r.movie_id,
            u.name, m.title_hu
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN movies m ON r.movie_id = m.id`,
    (err, reviews) => {
      if (err) return res.send('Hiba');
      res.render('admin', { reviews });
    }
  );
});

// KRITIKA TÖRLÉSE
router.post('/admin/delete-review/:id', requireLogin, requireAdmin, (req, res) => {
  const id = req.params.id;
  req.db.query('DELETE FROM reviews WHERE id = ?', [id], (err) => {
    if (err) return res.send('Hiba törléskor.');
    res.redirect('/admin');
  });
});

module.exports = router;
