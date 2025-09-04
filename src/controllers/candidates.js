import Election from "../models/election.js";
import User from "../models/User.js";

/**
 * Apply for a position in an election
 */
export const applyForPosition = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { positionName, party, manifesto, poster } = req.body;
    const userId = req.session?.userId; // Or req.user.id depending on your auth setup

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not logged in." });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found." });
    }

    if (election.status !== "upcoming") {
      return res.status(400).json({ message: "Applications are only allowed for upcoming elections." });
    }

    const positionExists = election.positions.some(
      (pos) => pos.positionName.toLowerCase() === positionName.toLowerCase()
    );
    if (!positionExists) {
      return res.status(400).json({ message: "Invalid position name." });
    }

    const alreadyApplied = election.candidates.some(
      (c) => c.userId.toString() === userId.toString() && c.position.toLowerCase() === positionName.toLowerCase()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this position." });
    }

    const newApplication = {
      userId,
      party,
      manifesto,
      poster: poster || "",
      position: positionName,
      approved: false,
      applicationDate: new Date(),
    };
    election.candidates.push(newApplication);
    await election.save();

    // Now, also update the user's applications
    const user = await User.findById(userId);
    if (user) {
      user.applications.push({
        electionId: election._id,
        applicationId: newApplication._id,
      });
      await user.save();
    }

    res.status(201).json({ message: "Application submitted successfully.", election });
  } catch (error) {
    console.error("Error applying for position:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

/**
 * Get dashboard data for a single active candidate application.
 * This endpoint is for the main dashboard view.
 */
export const getCandidateDashboard = async (req, res) => {
  try {
    const userId = req.user.id; // User ID from the authentication middleware

    // Find the single active application for the user.
    // We assume there's only one active/approved application at a time for the dashboard.
    const user = await User.findById(userId).populate({
      path: 'applications.applicationId',
      model: 'Application',
      populate: {
        path: 'electionId',
        model: 'Election',
        select: 'title description startDate endDate status positions'
      }
    });

    const activeApp = user.applications.find(app => app.applicationId && app.applicationId.status === 'approved');

    if (!activeApp) {
      return res.status(404).json({ message: "No approved application found for the dashboard." });
    }

    const application = activeApp.applicationId;
    const election = application.electionId;

    // Fetch all candidates for the same position in the election
    const candidatesInPosition = await Election.aggregate([
      { $match: { _id: election._id } },
      { $unwind: "$candidates" },
      { $match: { "candidates.position": application.position, "candidates.status": "approved" } },
      {
        $lookup: {
          from: 'users',
          localField: 'candidates.candidateId',
          foreignField: '_id',
          as: 'candidateProfile'
        }
      },
      { $unwind: "$candidateProfile" },
      {
        $project: {
          _id: "$candidates._id",
          firstName: "$candidateProfile.firstName",
          lastName: "$candidateProfile.lastName",
          votes: { $size: "$candidates.votes" }
        }
      }
    ]);

    // Sort candidates by votes to determine rank
    candidatesInPosition.sort((a, b) => b.votes - a.votes);
    const rank = candidatesInPosition.findIndex(c => c._id.toString() === application._id.toString()) + 1;

    // Construct the competition data for the bar chart
    const competitionData = {
      labels: candidatesInPosition.map(c => c._id.toString() === application._id.toString() ? 'You' : `${c.firstName} ${c.lastName}`),
      datasets: [
        {
          label: "Votes",
          data: candidatesInPosition.map(c => c.votes),
          backgroundColor: candidatesInPosition.map(c => c._id.toString() === application._id.toString() ? '#0d6efd' : '#ffc107'),
        }
      ]
    };

    const dashboardData = {
      candidate: {
        totalVotes: application.votes.length,
        rank,
        applicationStatus: application.status
      },
      competition: competitionData,
      election: {
        title: election.title,
        timeRemaining: "N/A", // This is complex to calculate in real-time on the backend; placeholder for now
      },
    };

    res.status(200).json(dashboardData);

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

/**
 * Get all applications for the authenticated candidate.
 * This endpoint is for the My Applications page.
 */
export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const applications = await Application.find({ candidateId: userId }).populate('electionId', 'title description startDate endDate status');

        if (!applications || applications.length === 0) {
            return res.status(404).json({ message: "No applications found for this user." });
        }

        const formattedApplications = applications.map(app => ({
            ...app.toObject(),
            election: app.electionId,
            candidate: {
                // Assuming you have the user details from req.user
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
            }
        }));

        res.status(200).json(formattedApplications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};