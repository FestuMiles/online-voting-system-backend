import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '', unique: true },
    phone: { type: String, default: '' },
    studentId: { type: String, default: '' },
    school: { type: String, default: '' },
    yearOfStudy: { type: String, default: '' },
    department: { type: String, default: '' },
    password: { type: String, default: '', minlength: 6 },
    agreeTerms: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    madeAdminBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    candidateElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],
}, { timestamps: true });

// Check if the model already exists before compiling it
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;