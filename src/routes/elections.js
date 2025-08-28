import { Router } from "express";
import {
  getAllElections,
  getElectionById,
  getElectionPositions,
  getCandidatesForPosition,
  submitVote,
  createElection,
} from "../controllers/elections.js";
import { isLoggedIn, isAdmin } from "../middlewares/authentication.js";

const router = Router();

// Public routes (no authentication required)
router.get("/", getAllElections);
router.get("/:id", getElectionById);
router.get("/:id/positions", getElectionPositions);
router.get("/:id/positions/:positionId/candidates", getCandidatesForPosition);

// Protected routes (authentication required)
router.post("/:id/positions/:positionId/vote", isLoggedIn, submitVote);

// Admin routes (admin authentication required)
router.post("/", isAdmin, createElection);

export default router;
