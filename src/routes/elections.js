import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getAllElections,
  getElectionById,
  getElectionPositions,
  getCandidatesForPosition,
  submitVote,
  createElection,
  editElection,
  deleteElection,
  getNumOfActiveElections,
  getNumOfUpcomingElections,
  getNumOfCompletedElections,
  addPositionToElection,
  removePositionFromElection,
  editPositionInElection,
  getElectionCandidates,
  toggleCandidateApproval
} from "../controllers/elections.js";
import { applyForPosition, getApplicationStatus } from "../controllers/elections.js";
import { isLoggedIn, isAdmin } from "../middlewares/authentication.js";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posters/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'poster-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = Router();

// Public routes (no authentication required)
router.get("/", getAllElections);
// Put more specific routes BEFORE generic `/:id`
router.get("/stats/active", getNumOfActiveElections);
router.get("/stats/upcoming", getNumOfUpcomingElections);
router.get("/stats/completed", getNumOfCompletedElections);
router.get("/:id/positions/:positionId/candidates", getCandidatesForPosition);
router.get("/:id/positions", getElectionPositions);
router.get("/:id", getElectionById);

// Protected routes (authentication required)
router.post("/:id/positions/:positionId/vote", isLoggedIn, submitVote);
router.post("/:id/apply", upload.single('poster'), applyForPosition);
router.get("/:id/application-status", isLoggedIn, getApplicationStatus);

// Admin routes (admin authentication required)
router.post("/createElection", isAdmin, createElection);
router.patch("/:id/editElection", isAdmin, editElection);
router.patch("/:electionId/positions/add", isAdmin, addPositionToElection);
router.patch("/:electionId/positions/:positionName/edit", isAdmin, editPositionInElection);
router.get("/:electionId/candidates", isAdmin, getElectionCandidates);
router.patch("/:electionId/positions/:positionName/delete", isAdmin, removePositionFromElection);
router.delete("/:id/deleteElection", isAdmin, deleteElection);
router.patch("/:electionId/candidates/:candidateId/toggleApproval", isAdmin, toggleCandidateApproval);

export default router;
