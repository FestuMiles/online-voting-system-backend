import Election from "../models/election.js";

// Get the currently active election
export const getActiveElection = async (req, res) => {
  try {
    const now = new Date();

    const activeElection = await Election.findOne({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: "ongoing",
    }).populate("candidates.userId", "name email");

    if (!activeElection) {
      return res.status(404).json({ message: "No active election found" });
    }

    res.status(200).json(activeElection);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get upcoming elections (with pagination)
export const getUpcomingElections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const upcomingElections = await Election.find({
      startDate: { $gt: new Date() },
      status: "upcoming",
    })
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(upcomingElections);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
