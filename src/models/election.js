import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
    {
        _id: ObjectId,
        title: String,
        description: String,
        startDate: Date,
        endDate: Date,
        positions: [{
            positionName: {type: String, unique: true}, 
            seats: Number, 
            description: String
        }],
        status: { type: String, enum: ["upcoming", "ongoing", "completed"] },
        candidates: [{
            _id: ObjectId,
            party: String,
            manifesto: String,
            poster: String,
            position: String,
            approaved: { type: Boolean, default: false }
        }], // refs to Users who are candidates
        votes: [{
            voterId: ObjectId, //Hashed Id
            candidateId: ObjectId
        }],     // refs to Users who are voters
        createdAt: Date,
        updatedAt: Date
    }
)

