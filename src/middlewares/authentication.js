import Election from "../models/election.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export async function isLoggedIn(req, res, next) {
  try {
    // Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = { id: user._id, email: user.email, isAdmin: user.isAdmin };
        return next();
      }
    }
    
    // Fallback to session-based auth
    if (req.session && req.session.isLoggedIn) {
      req.user = { id: req.session.userId, isAdmin: req.session.isAdmin };
      return next();
    }
    
    return res.status(401).json({ message: "Unauthorized: Please log in." });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

export function isAdmin(req, res, next) {
  if ((req.user && req.user.isAdmin) || (req.session && req.session.isAdmin)) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Admins only." });
}

export async function isCandidate(req, res, next) {
  const userId = req.user?.id || req.session?.userId;
  const electionId = req.params.electionId;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const election = await Election.findById(electionId);
  if (!election) {
    return res.status(404).json({ message: "Election not found." });
  }

  const isCandidate = election.candidates.some(c => c.userId.toString() === userId.toString());
  if (isCandidate) {
    return next();
  }

  return res.status(403).json({ message: "Access denied. You are not a candidate." });
}
