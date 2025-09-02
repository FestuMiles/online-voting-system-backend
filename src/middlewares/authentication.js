import Election from "../models/election.js";


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

export async function isCandidate(req, res, next) {
  const userId = req.session.userId;
  const electionId = req.params.electionId;

  const election = await Election.findById(electionId);
  if (!election) {
    return res.status(404).json({ message: "Election not found." });
  }

  const isCandidate = election.candidates.some(c => c.userId.toString() === userId);
  if (isCandidate) {
    return next();
  }

  return res.status(403).json({ message: "Access denied. You are not a candidate." });
}
