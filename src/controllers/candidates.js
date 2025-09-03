import Election from "../models/election.js";

/**
 * Apply for a position in an election
 */
export const applyForPosition = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { positionName, party, manifesto, poster } = req.body;
    const userId = req.session?.userId; // adjust depending on auth system

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not logged in." });
    }

    // Find election
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    // Check if election status allows applications
    if (election.status !== "upcoming") {
      return res.status(400).json({ message: "Applications are only allowed for upcoming elections." });
    }

    // Check if position exists in election
    const positionExists = election.positions.some(
      (pos) => pos.positionName.toLowerCase() === positionName.toLowerCase()
    );
    if (!positionExists) {
      return res.status(400).json({ message: "Invalid position name." });
    }

    // Check if candidate already applied for this position
    const alreadyApplied = election.candidates.some(
      (c) => c.userId.toString() === userId.toString() && c.position === positionName
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this position." });
    }

    // Add candidate to election
    election.candidates.push({
      userId,
      party,
      manifesto,
      poster: poster || "",
      position: positionName,
      approved: false, // default
    });

    await election.save();

    res.status(201).json({ message: "Application submitted successfully.", election });
  } catch (error) {
    console.error("Error applying for position:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
