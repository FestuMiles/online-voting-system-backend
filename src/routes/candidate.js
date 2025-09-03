import { Router } from "express";
import { applyForPosition } from "../controllers/candidates.js";

import { isLoggedIn } from "../middlewares/authentication.js";
const router = Router();

// Route to apply for a position in an election
router.post("/:electionId/apply", isLoggedIn, applyForPosition);
export default router;
// This route listens for POST requests at /:electionId/apply and calls the applyForPosition controller function