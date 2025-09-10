// src/models/candidate.js

import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true
    },
    position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position',
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    slogan: {
        type: String
    },
    profilePicture: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Candidate = mongoose.model('Candidate', CandidateSchema);

export default Candidate;