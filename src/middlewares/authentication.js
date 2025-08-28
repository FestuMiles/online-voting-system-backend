export function isLoggedIn(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized: Please log in." });
}
export function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admins only." });
}
