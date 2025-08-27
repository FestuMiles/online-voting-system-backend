import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
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
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Registration", registrationSchema);