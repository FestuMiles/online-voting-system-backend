import mongoose from "mongoose";

const candidateApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  manifesto: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
  votes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
});

const CandidateApplication = mongoose.model("CandidateApplication", candidateApplicationSchema);
export default CandidateApplication;