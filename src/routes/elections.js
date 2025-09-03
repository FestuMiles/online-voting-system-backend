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
  getNumOfCompletedElections,
  addPositionToElection,
  removePositionFromElection
} from "../controllers/elections.js";
import { isLoggedIn, isAdmin } from "../middlewares/authentication.js";

const router = Router();

// Public routes (no authentication required)
router.get("/", getAllElections);
router.get("/:id", getElectionById);
router.get("/:id/positions", getElectionPositions);
router.get("/:id/positions/:positionId/candidates", getCandidatesForPosition);
router.get("/stats/active", getNumOfActiveElections);
router.get("/stats/upcoming", getNumOfUpcomingElections);
router.get("/stats/completed", getNumOfCompletedElections);

// Protected routes (authentication required)
router.post("/:id/positions/:positionId/vote", isLoggedIn, submitVote);

// Admin routes (admin authentication required)
router.post("/createElection", isAdmin, createElection);
router.put("/:id/editElection", isAdmin, editElection);
router.patch("/:electionId/positions/add", isAdmin, addPositionToElection);
router.patch("/:electionId/positions/:positionName/delete", isAdmin, removePositionFromElection);

export default router;
