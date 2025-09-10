// registerUser.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// 1. Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/online_voting_system", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// 2. Define User schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  studentId: String,
  school: String,
  yearOfStudy: String,
  department: String,
  password: { type: String, required: true },
  agreeTerms: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
}, { collection: "users" }); // Force collection name "users"

// 3. Create User model
const User = mongoose.model("User", userSchema);

// 4. Register function
const registerUser = async () => {
  try {
    const plainPassword = "12345678";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = new User({
      firstName: "John",
      lastName: "Doe",
      email: "f@gmail.com",
      phone: "1234567890",
      studentId: "S123456",
      school: "Engineering",
      yearOfStudy: "4",
      department: "Computer Science",
      password: hashedPassword,
      agreeTerms: true,
      isAdmin: true,
    });

    await user.save();
    console.log("User registered successfully:", user);
  } catch (error) {
    console.error("Registration error:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// 5. Run function
registerUser();
