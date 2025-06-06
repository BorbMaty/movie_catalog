function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Hozzáférés megtagadva.');
  }
  next();
}

module.exports = { requireLogin, requireAdmin };