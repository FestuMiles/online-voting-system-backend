import Election from "../models/election.js";
import User from "../models/user.js";
import crypto from "crypto";

// Get all elections
export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find({})
      .select("title description startDate endDate status positions candidates")
      .sort({ startDate: -1 });

    res.status(200).json(elections);
  } catch (error) {
    console.error("Error fetching elections:", error);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

// Get single election by ID
export const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.status(200).json(election);
  } catch (error) {
    console.error("Error fetching election:", error);
    res.status(500).json({ message: "Failed to fetch election" });
  }
};

// Get positions for an election
export const getElectionPositions = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id).select("positions");

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    res.status(200).json(election.positions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ message: "Failed to fetch positions" });
  }
};

// Get candidates for a specific position
export const getCandidatesForPosition = async (req, res) => {
  try {
    const { id, positionId } = req.params;
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Find the position
    const position = election.positions.find(
      (p) => p.positionName === positionId
    );
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Get candidates for this position
    const candidates = election.candidates.filter(
      (c) => c.position === positionId && c.approved
    );

    // Populate user details for candidates
    const candidatesWithDetails = await Promise.all(
      candidates.map(async (candidate) => {
        const user = await User.findById(candidate.userId).select(
          "firstName lastName email"
        );
        return {
          ...candidate.toObject(),
          user: user || { firstName: "Unknown", lastName: "User" },
        };
      })
    );

    res.status(200).json({
      position,
      candidates: candidatesWithDetails,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

// Submit a vote
export const submitVote = async (req, res) => {
  try {
    const { id, positionId } = req.params;
    const { candidateId } = req.body;

    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Check if election is ongoing
    if (election.status !== "ongoing") {
      return res
        .status(400)
        .json({ message: "Voting is not active for this election" });
    }

    // Check if position exists
    const position = election.positions.find(
      (p) => p.positionName === positionId
    );
    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Check if candidate exists and is approved
    const candidate = election.candidates.find(
      (c) =>
        c._id.toString() === candidateId &&
        c.position === positionId &&
        c.approved
    );
    if (!candidate) {
      return res
        .status(404)
        .json({ message: "Candidate not found or not approved" });
    }

    // Create hashed voter ID for privacy
    const hashedVoterId = crypto
      .createHash("sha256")
      .update(req.session.userId.toString())
      .digest("hex");

    // Check if user has already voted for this position
    const existingVote = election.votes.find(
      (v) => v.voterId === hashedVoterId && v.position === positionId
    );
    if (existingVote) {
      return res
        .status(400)
        .json({ message: "You have already voted for this position" });
    }

    // Add the vote
    election.votes.push({
      voterId: hashedVoterId,
      candidateId: candidate._id,
      position: positionId,
      votedAt: new Date(),
    });

    await election.save();

    res.status(200).json({ message: "Vote submitted successfully" });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ message: "Failed to submit vote" });
  }
};

// Create new election (Admin only)
export const createElection = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { title, description, startDate, endDate, positions } = req.body;

    // Basic validation
    if (!title || !description || !startDate || !endDate || !positions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
      positions,
      status: "upcoming",
    });

    await newElection.save();

    res.status(201).json({
      message: "Election created successfully",
      election: newElection,
    });
  } catch (error) {
    console.error("Error creating election:", error);
    res.status(500).json({ message: "Failed to create election" });
  }
};
