import session from "express-session";
import User from "../models/user.js";

// Controller to retrieve all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};

//retrieving the total number of users
const getTotalNumberOfUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    console.log("Total number of users:", totalUsers);
    res.status(200).json({ totalUsers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving total number of users", error });
  }
};

// Return current logged-in user profile
const getCurrentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.session.userId).select(
      "firstName lastName email phone studentId school yearOfStudy department isAdmin createdAt"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving current user", error });
  }
};

// Update current user's editable fields (email, phone)
const updateCurrentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { email, phone } = req.body;
    const updates = {};

    if (typeof email === "string") {
      const emailTrim = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // Check uniqueness if email changed
      const existing = await User.findOne({ email: emailTrim });
      if (existing && String(existing._id) !== String(req.session.userId)) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updates.email = emailTrim;
    }

    if (typeof phone === "string") {
      const phoneTrim = phone.trim();
      // Basic phone validation (optional, len 7-20)
      if (phoneTrim && (phoneTrim.length < 7 || phoneTrim.length > 20)) {
        return res.status(400).json({ message: "Invalid phone number" });
      }
      updates.phone = phoneTrim;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updated = await User.findByIdAndUpdate(
      req.session.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select:
          "firstName lastName email phone studentId school yearOfStudy department isAdmin createdAt",
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // Keep session email in sync if changed
    if (updates.email) {
      req.session.userEmail = updates.email;
    }

    return res.status(200).json({ message: "Profile updated", user: updated });
  } catch (error) {
    console.error("Update current user error:", error);
    return res.status(500).json({ message: "Error updating user", error });
  }
};

//Deleting a user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Deleting user with ID:", userId);
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

//Making a user an admin
const makeUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Making user admin with ID:", userId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true, madeAdminBy: req.session.userId },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({
        message: "User promoted to admin successfully",
        user: updatedUser,
      });
  } catch (error) {
    console.log("Error promoting user to admin:", error);
    res.status(500).json({ message: "Error promoting user to admin", error });
  }
};

// Revoking admin rights from a user by setting isAdmin to false and madeAdminBy to null - only the madeAdminBy user can revoke admin rights
const revokeAdminRights = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Revoking admin rights for user with ID:", userId);
    const userToRevoke = await User.findById(userId);
    if (!userToRevoke) {
      return res.status(404).json({ message: "User not found" });
    }
    if (userToRevoke.madeAdminBy?.toString() !== req.session.userId) {
      return res
        .status(403)
        .json({
          message:
            "You do not have permission to revoke this user's admin rights",
        });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isAdmin: false, madeAdminBy: null },
      { new: true }
    );
    res
      .status(200)
      .json({
        message: "Admin rights revoked successfully",
        user: updatedUser,
      });
  } catch (error) {
    console.log("Error revoking admin rights:", error);
    res.status(500).json({ message: "Error revoking admin rights", error });
  }
};

//Checking if a user is involved in any election as a candidate
const isUserCandidateInAnyElection = async (req, res) => {
  console.log("Checking if user is a candidate in any election");
  try {
    const userId = req.session.userId; // adjust depending on auth system
    console.log("Session userId:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not logged in." });
    }

    console.log("Checking if user is a candidate with ID:", userId);
    const user = await User.findById(userId).populate("candidateElections");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isCandidate = user.candidateElections && user.candidateElections.length > 0;
    res.status(200).json({ isCandidate, elections: user.candidateElections });
  } catch (error) {
    console.log("Error checking if user is a candidate:", error);
    res.status(500).json({ message: "Error checking candidate status", error });
  }
 }

// Exporting the controllers
export default getAllUsers;
export {
  deleteUser,
  getTotalNumberOfUsers,
  getCurrentUser,
  updateCurrentUser,
  makeUserAdmin,
  revokeAdminRights,
  isUserCandidateInAnyElection
};
