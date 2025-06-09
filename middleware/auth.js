//Middleware hitelesítéshez és jogosultságokhoz
function requireLogin(req, res, next) {
  if (!req.session.userId) { // Ellenőrzi, hogy a felhasználó be van-e jelentkezve
    return res.redirect('/login'); // Ha nincs bejelentkezve, átirányítja a bejelentkezési oldalra
  }
  next();
}

// Middleware az adminisztrátori jogosultságok ellenőrzéséhez
function requireAdmin(req, res, next) { // Ellenőrzi, hogy a felhasználó adminisztrátori jogosultságokkal rendelkezik-e
  if (req.session.role !== 'admin') { // Ha a session-ben tárolt szerep nem admin
    return res.status(403).send('Hozzáférés megtagadva.'); // Ha nem admin, 403-as státuszkódot küld vissza
  }
  next();
}

module.exports = { requireLogin, requireAdmin }; // Exportálja a middleware függvényeket, hogy más fájlokban is használhatóak legyenek