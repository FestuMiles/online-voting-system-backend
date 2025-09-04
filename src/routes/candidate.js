import { Router } from "express";
import { applyForPosition, getCandidateDashboard, getMyApplications } from "../controllers/candidates.js";
import { isLoggedIn } from "../middlewares/authentication.js";

const router = Router();

// Route to apply for a position in an election
router.post("/:electionId/apply", isLoggedIn, applyForPosition);

// Route to get all applications for the authenticated candidate
router.get("/applications/my", isLoggedIn, getMyApplications);

// Route to get dashboard data for the authenticated candidate
router.get("/dashboard", isLoggedIn, getCandidateDashboard);

export default router;