import CandidateApplication from "../models/CandidateApplication.js";
import Election from "../models/election.js";
import User from "../models/user.js";

/**
 * Apply for a position in an election
 */
export const applyForPosition = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { positionName, manifesto } = req.body;
    const userId = req.session?.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not logged in." });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    const alreadyApplied = await CandidateApplication.findOne({
      user: userId,
      election: electionId,
      position: positionName,
    });
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this position." });
    }

    const newApplication = new CandidateApplication({
      user: userId,
      election: electionId,
      position: positionName,
      manifesto: manifesto,
      status: "Pending",
    });

    await newApplication.save();

    res.status(201).json({
      message: "Application submitted successfully.",
      application: newApplication,
    });
  } catch (error) {
    console.error("Error applying for position:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get all applications for the authenticated candidate.
 */
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.session.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not logged in." });
    }

    const applications = await CandidateApplication.find({ user: userId })
      .populate("election", "title description startDate endDate status")
      .lean();

    if (!applications || applications.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get dashboard data for any candidate application status.
 */
export const getCandidateDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not logged in." });
    }

    const myApplication = await CandidateApplication.findOne({
      user: userId,
    }).sort({ applicationDate: -1 });

    if (!myApplication) {
      return res.status(404).json({ message: "No candidate applications found." });
    }

    if (myApplication.status !== "Approved") {
      const electionDetails = await Election.findById(myApplication.election._id, 'title status');
      return res.status(200).json({
        candidate: {
          totalVotes: 0,
          rank: "N/A",
          applicationStatus: myApplication.status,
        },
        competition: null,
        election: {
          title: electionDetails.title,
          status: electionDetails.status,
        },
        message: `Your application is currently ${myApplication.status}. You will see full dashboard data once it's approved.`,
      });
    }

    const election = await Election.findById(myApplication.election._id);

    const competingCandidates = await CandidateApplication.find({
      election: election._id,
      position: myApplication.position,
      status: "Approved",
    }).populate("user", "firstName lastName");

    const myVotes = myApplication.votes.length;
    competingCandidates.sort((a, b) => b.votes.length - a.votes.length);

    const rank = competingCandidates.findIndex(c => c._id.toString() === myApplication._id.toString()) + 1;

    const competitionData = {
      labels: competingCandidates.map(c => c.user.firstName + ' ' + c.user.lastName),
      data: competingCandidates.map(c => c.votes.length),
      backgroundColor: competingCandidates.map(c =>
        c._id.toString() === myApplication._id.toString() ? '#0d6efd' : '#ffc107'
      ),
    };

    const dashboardData = {
      candidate: {
        totalVotes: myVotes,
        rank,
        applicationStatus: myApplication.status,
      },
      competition: competitionData,
      election: {
        title: election.title,
        status: election.status,
      },
    };

    res.status(200).json(dashboardData);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * Check if a user is a candidate
 */
export const isCandidate = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const isCandidate = await CandidateApplication.findOne({ user: userId, status: "Approved" });
    res.status(200).json({ isCandidate: !!isCandidate });
  } catch (error) {
    console.error("Error checking candidate status:", error);
    res.status(500).json({ message: "Server error." });
  }
};