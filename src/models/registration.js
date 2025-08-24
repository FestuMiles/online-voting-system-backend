import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '', unique: true },
    phone: { type: String, default: '' },
    dob: { type: Date },
    nationalId: { type: String, default: '' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    password: { type: String, default: '', minlength: 6 },
    agreeTerms: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Registration", registrationSchema);