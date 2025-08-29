import Election from "../models/election.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";

function computeStatus(startDate, endDate) {
  const now = new Date();
  if (now < startDate) return "upcoming";
  if (now > endDate) return "completed";
  return "ongoing";
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function ensureCandidateUsers() {
  const candidateSpecs = [
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.president@example.com",
      party: "Unity Party",
    },
    {
      firstName: "Brian",
      lastName: "Kim",
      email: "brian.president@example.com",
      party: "Progress Alliance",
    },
    {
      firstName: "Cynthia",
      lastName: "Lopez",
      email: "cynthia.vp@example.com",
      party: "Unity Party",
    },
    {
      firstName: "David",
      lastName: "Nguyen",
      email: "david.vp@example.com",
      party: "People First",
    },
    {
      firstName: "Ella",
      lastName: "Martins",
      email: "ella.secretary@example.com",
      party: "Progress Alliance",
    },
  ];

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const createdOrFound = [];
  for (const spec of candidateSpecs) {
    let user = await User.findOne({ email: spec.email });
    if (!user) {
      user = await User.create({
        firstName: spec.firstName,
        lastName: spec.lastName,
        email: spec.email,
        phone: "",
        studentId: "",
        school: "",
        yearOfStudy: "",
        department: "",
        password: passwordHash,
        agreeTerms: true,
        isAdmin: false,
      });
    }
    createdOrFound.push({ ...spec, userId: user._id });
  }

  return createdOrFound;
}

async function ensureCandidatesOnElection(election) {
  if (!election) return;

  // If candidates already present, skip
  if (election.candidates && election.candidates.length > 0) {
    return;
  }

  const users = await ensureCandidateUsers();

  // Build candidates mapped to existing positions
  const positionsByName = new Set(
    (election.positions || []).map((p) => p.positionName)
  );

  const safeAdd = (positionName, party, manifesto, userEmail) => {
    if (!positionsByName.has(positionName)) return null;
    const user = users.find((u) => u.email === userEmail);
    if (!user) return null;
    return {
      userId: user.userId,
      party,
      manifesto,
      poster: "",
      position: positionName,
      approved: true,
    };
  };

  const candidateDocs = [
    safeAdd(
      "President",
      "Unity Party",
      "I will improve student services, transparency, and campus life.",
      "alice.president@example.com"
    ),
    safeAdd(
      "President",
      "Progress Alliance",
      "Modernize facilities and empower student organizations.",
      "brian.president@example.com"
    ),
    safeAdd(
      "Vice President",
      "Unity Party",
      "Support the president and streamline council operations.",
      "cynthia.vp@example.com"
    ),
    safeAdd(
      "Vice President",
      "People First",
      "Focus on inclusivity and communication across departments.",
      "david.vp@example.com"
    ),
    safeAdd(
      "Secretary",
      "Progress Alliance",
      "Improve documentation, communication, and public access to records.",
      "ella.secretary@example.com"
    ),
  ].filter(Boolean);

  election.candidates = candidateDocs;
  await election.save();
}

export const createSampleElections = async () => {
  try {
    // If no elections, create base elections first with realistic windows
    const existingElections = await Election.countDocuments();

    if (existingElections === 0) {
      const ongoingStart = daysFromNow(-7);
      const ongoingEnd = daysFromNow(7);
      const upcomingStart = daysFromNow(10);
      const upcomingEnd = daysFromNow(20);
      const completedStart = daysFromNow(-30);
      const completedEnd = daysFromNow(-20);

      const sampleElections = [
        {
          title: "Student Council Election 2025",
          description: "Annual election for student council positions",
          startDate: ongoingStart,
          endDate: ongoingEnd,
          status: computeStatus(ongoingStart, ongoingEnd),
          positions: [
            {
              positionName: "President",
              seats: 1,
              description:
                "Lead the student council and represent student body",
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
          startDate: upcomingStart,
          endDate: upcomingEnd,
          status: computeStatus(upcomingStart, upcomingEnd),
          positions: [
            {
              positionName: "Computer Science Rep",
              seats: 2,
              description: "Represent CS department in faculty meetings",
            },
            {
              positionName: "Engineering Rep",
              seats: 2,
              description:
                "Represent Engineering department in faculty meetings",
            },
          ],
          candidates: [],
          votes: [],
        },
        {
          title: "School Board Election 2025",
          description: "Annual school board member election",
          startDate: completedStart,
          endDate: completedEnd,
          status: computeStatus(completedStart, completedEnd),
          positions: [
            {
              positionName: "Board Member",
              seats: 3,
              description: "Represent the student body on the school board",
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
      console.log("Base sample elections created");
    }

    // Normalize statuses of existing elections based on dates
    const allElections = await Election.find({});
    for (const el of allElections) {
      const desired = computeStatus(
        new Date(el.startDate),
        new Date(el.endDate)
      );
      if (el.status !== desired) {
        el.status = desired;
        await el.save();
      }
    }

    // Ensure an ongoing election has candidates
    const ongoingElection = await Election.findOne({ status: "ongoing" });
    if (ongoingElection) {
      await ensureCandidatesOnElection(ongoingElection);
      console.log("Sample candidates added to ongoing election");
    } else {
      // Fallback: populate the first election we find
      const anyElection = await Election.findOne({});
      if (anyElection) {
        await ensureCandidatesOnElection(anyElection);
        console.log("Sample candidates added to an existing election");
      }
    }

    console.log("Sample elections populated successfully");
  } catch (error) {
    console.error("Error creating sample elections:", error);
  }
};
