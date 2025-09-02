// const [settings, setSettings] = useState({
//     schoolName: "",
//     defaultElectionDuration: 7, // days
//     maxCandidatesPerElection: 5,
//     sessionTimeout: 30, // minutes
//     enableEmailNotifications: true,
//   });

import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
    schoolName: { type: String, default: "" },
    defaultElectionDuration: { type: Number, default: 7 }, // days
    maxCandidatesPerElection: { type: Number, default: 5 },
    sessionTimeout: { type: Number, default: 30 }, // minutes
    enableEmailNotifications: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("Settings", settingsSchema);