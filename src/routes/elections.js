import { Router } from "express";
import {
  getAllElections,
  getElectionById,
  getElectionPositions,
  getCandidatesForPosition,
  submitVote,
  createElection,
  editElection,
  getNumOfActiveElections,
  getNumOfUpcomingElections,
  getNumOfCompletedElections
} from "../controllers/elections.js";
import { applyForPosition, getApplicationStatus } from "../controllers/elections.js";
import { isLoggedIn, isAdmin } from "../middlewares/authentication.js";

const router = Router();

// Public routes (no authentication required)
router.get("/", getAllElections);
// Put more specific routes BEFORE generic `/:id`
router.get("/stats/active", getNumOfActiveElections);
router.get("/stats/upcoming", getNumOfUpcomingElections);
router.get("/stats/completed", getNumOfCompletedElections);
router.get("/:id/positions/:positionId/candidates", getCandidatesForPosition);
router.get("/:id/positions", getElectionPositions);
router.get("/:id/applications/status", getApplicationStatus);
router.get("/:id", getElectionById);

// Protected routes (authentication required)
router.post("/:id/positions/:positionId/vote", isLoggedIn, submitVote);
router.post("/:id/applications", applyForPosition);

// Admin routes (admin authentication required)
router.post("/createElection", isAdmin, createElection);
router.put("/:id/editElection", isAdmin, editElection);

export default router;
