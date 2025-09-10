import express from "express";
import { getActiveElection, getUpcomingElections } from "../controllers/electionController.js";

const router = express.Router();

router.get("/active", getActiveElection);
router.get("/upcoming", getUpcomingElections);

export default router;
