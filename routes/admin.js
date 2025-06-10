const express = require('express'); // Express alkalmazás létrehozása
const router = express.Router(); // Útvonalak kezelése
const { requireLogin, requireAdmin } = require('../middleware/auth'); // Hitelesítési middleware-ek importálása

// ADMIN PANEL MEGJELENÍTÉSE
router.get('/admin', requireLogin, requireAdmin, (req, res) => { 
  req.db.query( 
    `SELECT r.id AS review_id, r.text, r.created_at, u.name, m.title_hu  
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN movies m ON r.movie_id = m.id`,
    (err, reviews) => {
      if (err) return res.send('Hiba'); // Hiba kezelése
      // Admin panel megjelenítése a lekérdezett adatokkal
      res.render('admin', { reviews });  // EJS sablon renderelése
    }
  );
});



// KRITIKA TÖRLÉSE
router.post('/admin/delete-review/:id', requireLogin, requireAdmin, (req, res) => { // Kritika törlése
  const id = req.params.id; // Kritika azonosítója az URL-ből
  req.db.query('DELETE FROM reviews WHERE id = ?', [id], (err) => { // Törlés végrehajtása
    if (err) return res.send('Hiba törléskor.'); // Hiba kezelése
    res.redirect('/admin'); // Visszairányítás az admin panelre
  });
});

module.exports = router; // Admin útvonalak exportálása, hogy más fájlokban is használhatóak legyenek
