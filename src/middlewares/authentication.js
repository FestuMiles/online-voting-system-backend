export function isLoggedIn(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Please log in.' });
}