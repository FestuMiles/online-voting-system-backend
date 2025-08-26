import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
    {
        _id: ObjectId,
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        status: { type: String, enum: ["upcoming", "ongoing", "completed"] },
        candidates: [{
            _id: ObjectId,
            party: String,
            manifesto: String
        }], // refs to Users who are candidates
        votes: [ObjectId],     // refs to Users who are voters
        createdAt: Date,
        updatedAt: Date
    }
)