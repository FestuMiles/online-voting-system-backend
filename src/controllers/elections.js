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
    const election = await Election.findById(id).populate(
      "candidates.userId",
      "firstName lastName email"
    );

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

    const { title, description, startDate, endDate} = req.body;

    // Basic validation
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    //Checking if start date is in the past
    if (new Date(startDate) < new Date()) {
      return res
        .status(400)
        .json({ message: "Start date must be in the future" });
    }

    const newElection = new Election({
      title,
      description,
      startDate,
      endDate,
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


//Function for editing election 
export const editElection = async (req, res) => {
  try {

    const { id } = req.params;
    const { title, description, startDate, endDate, positions, status } = req.body;

    // Find the election to update
    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Update fields if provided
    if (title) election.title = title;
    if (description) election.description = description;
    if (startDate) election.startDate = startDate;
    if (endDate) election.endDate = endDate;
    if (positions) election.positions = positions;
    if (status && ["upcoming", "ongoing", "completed"].includes(status)) {
      election.status = status;
    }

    await election.save();

    res.status(200).json({
      message: "Election updated successfully",
      election,
    });
  } catch (error) {
    console.error("Error updating election:", error);
    res.status(500).json({ message: "Failed to update election" });
  }
}

export const getNumOfActiveElections = async (req, res) => {
  try {
    const count = await Election.countDocuments({ status: "ongoing" });
    console.log("Number of active elections:", count);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching active elections count:", error);
    res.status(500).json({ message: "Failed to fetch active elections count" });
  }
};

export const getNumOfUpcomingElections = async (req, res) => {
  try {
    const count = await Election.countDocuments({ status: "upcoming" });
    console.log("Upcoming elections count:", count);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching upcoming elections count:", error);
    res.status(500).json({ message: "Failed to fetch upcoming elections count" });
  }
};
export const getNumOfCompletedElections = async (req, res) => {
  try {
    const count = await Election.countDocuments({ status: "completed" });
    console.log("Completed elections count:", count);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching completed elections count:", error);
    res.status(500).json({ message: "Failed to fetch completed elections count" });
  }
};

// Delete an election (Admin only)
export const deleteElection = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { id } = req.params;
    console.log("Deleting election with ID:", id);

    const deletedElection = await Election.findByIdAndDelete(id);
    if (!deletedElection) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (error) {
    console.error("Error deleting election:", error);
    res.status(500).json({ message: "Failed to delete election" });
  }
};

/**
 * Add a new position to an election
 */
export const addPositionToElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { positionName, seats, description } = req.body;
    console.log("Request body:", req.body);
    console.log("Election ID:", electionId);

    // Validate input
    if (!positionName || !seats || !description) {
      return res.status(400).json({ message: "All fields are required (positionName, seats, description)." });
    }

    // Find election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    // Prevent duplicate positions
    const positionExists = election.positions.some(
      (pos) => pos.positionName.toLowerCase() === positionName.toLowerCase()
    );
    if (positionExists) {
      return res.status(400).json({ message: "Position already exists in this election." });
    }

    // Add position
    election.positions.push({ positionName, seats, description });
    await election.save();

    res.status(201).json({ message: "Position added successfully.", election });
  } catch (error) {
    console.error("Error adding position:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
/**
 * Remove a position from an election by positionName
 */
export const removePositionFromElection = async (req, res) => {
  try {
    const { electionId, positionName } = req.params;

    if (!positionName) {
      return res.status(400).json({ message: "Position name is required." });
    }

    // Find election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    // Check if position exists
    const positionIndex = election.positions.findIndex(
      (pos) => pos.positionName.toLowerCase() === positionName.toLowerCase()
    );

    if (positionIndex === -1) {
      return res.status(404).json({ message: "Position not found in this election." });
    }

    // Remove position
    election.positions.splice(positionIndex, 1);
    await election.save();

    res.status(200).json({ message: "Position removed successfully.", election });
  } catch (error) {
    console.error("Error removing position:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Apply to stand as a candidate for a position in an election
export const applyForPosition = async (req, res) => {
  try {
    const { id } = req.params; // election id
    const { party, manifesto, position, fullName, email } = req.body;
    let userId = req.user?.id; // From JWT middleware

    if (!party || !manifesto || !position) {
      return res.status(400).json({ message: "Party, manifesto, and position are required" });
    }

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Check if election allows applications (upcoming or ongoing)
    if (election.status === "completed") {
      return res.status(400).json({ message: "Cannot apply to completed elections" });
    }

    // Ensure position exists in election
    const positionExists = election.positions.some(
      (p) => p.positionName === position
    );
    if (!positionExists) {
      return res.status(404).json({ message: "Position not found in election" });
    }

    // If no authenticated user, create a temporary user or use provided info
    if (!userId) {
      if (!fullName || !email) {
        return res.status(400).json({ message: "Full name and email are required for guest applications" });
      }
      
      // Find or create user
      let user = await User.findOne({ email });
      if (!user) {
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ") || "";
        user = new User({ firstName, lastName, email });
        await user.save();
      }
      userId = user._id;
    }

    // Prevent duplicate applications for same user and position
    const alreadyApplied = election.candidates.some(
      (c) => c.position === position && c.userId.toString() === userId.toString()
    );
    if (alreadyApplied) {
      return res.status(409).json({ message: "You have already applied for this position" });
    }

    // Handle poster upload if present
    let posterPath = "";
    if (req.file) {
      posterPath = req.file.path || req.file.filename;
    }

    // Append candidate (unapproved by default)
    election.candidates.push({
      userId: userId,
      party,
      manifesto,
      poster: posterPath,
      position,
      approved: false,
    });

    await election.save();

    return res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error applying for position:", error);
    return res.status(500).json({ message: "Failed to submit application" });
  }
};

// Get application status by election and user
export const getApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params; // election id
    const userId = req.user?.id; // From JWT middleware

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const candidate = election.candidates.find((c) => c.userId.toString() === userId.toString());
    if (!candidate) {
      return res.status(200).json({ status: 'not_found' });
    }

    const user = await User.findById(userId).select('firstName lastName email');

    return res.status(200).json({
      status: candidate.approved ? 'accepted' : 'pending',
      details: {
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        position: candidate.position,
        party: candidate.party,
        manifesto: candidate.manifesto,
        poster: candidate.poster,
        applicationDate: candidate.createdAt || election.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching application status:', error);
    return res.status(500).json({ message: 'Failed to fetch application status' });
  }
};

