import mongoose from "mongoose";

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    positions: [
      {
        positionName: { type: String, required: true },
        seats: { type: Number, required: true, min: 1 },
        description: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
    candidates: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        party: { type: String, required: true },
        manifesto: { type: String, required: true },
        poster: { type: String, default: "" },
        position: { type: String, required: true },
        approved: { type: Boolean, default: false },
      },
    ],
    votes: [
      {
        voterId: { type: String, required: true }, // Hashed voter ID for privacy
        candidateId: { type: mongoose.Schema.Types.ObjectId, required: true },
        position: { type: String, required: true },
        votedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient queries
electionSchema.index({ status: 1, startDate: 1, endDate: 1 });
electionSchema.index({ "candidates.position": 1 });

export default mongoose.model("Election", electionSchema);
