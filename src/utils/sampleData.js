import Election from "../models/election.js";
import User from "../models/user.js";

export const createSampleElections = async () => {
  try {
    // Check if elections already exist
    const existingElections = await Election.countDocuments();
    if (existingElections > 0) {
      console.log("Sample elections already exist, skipping...");
      return;
    }

    // Create sample elections
    const sampleElections = [
      {
        title: "Student Council Election 2024",
        description: "Annual election for student council positions",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-01-20"),
        status: "ongoing",
        positions: [
          {
            positionName: "President",
            seats: 1,
            description: "Lead the student council and represent student body",
          },
          {
            positionName: "Vice President",
            seats: 1,
            description: "Assist the president and manage council activities",
          },
          {
            positionName: "Secretary",
            seats: 1,
            description: "Handle council documentation and communications",
          },
        ],
        candidates: [],
        votes: [],
      },
      {
        title: "Department Representative Election",
        description: "Election for department representatives",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-05"),
        status: "upcoming",
        positions: [
          {
            positionName: "Computer Science Rep",
            seats: 2,
            description: "Represent CS department in faculty meetings",
          },
          {
            positionName: "Engineering Rep",
            seats: 2,
            description: "Represent Engineering department in faculty meetings",
          },
        ],
        candidates: [],
        votes: [],
      },
    ];

    for (const electionData of sampleElections) {
      const election = new Election(electionData);
      await election.save();
    }

    console.log("Sample elections created successfully");
  } catch (error) {
    console.error("Error creating sample elections:", error);
  }
};
