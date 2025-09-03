import express from "express";
import { connectDB } from "./src/config/database.js";
import dotenv from "dotenv";
import session from "express-session";
import cors from "cors";
import MongoStore from "connect-mongo";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import candidateRoutes from "./src/routes/candidate.js";
import electionRoutes from "./src/routes/elections.js";
import settingsRoutes from "./src/routes/admin.js";
import { createSampleElections } from "./src/utils/sampleData.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // or wherever your React app is hosted
    credentials: true, // <-- allow sending of cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION SETUP

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Routes
app.use("/reg", authRoutes);
app.use("/admin/users", userRoutes);
app.use("/api/elections", electionRoutes);
app.use("/admin", settingsRoutes);
app.use("/candidates", candidateRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

connectDB().then(async () => {
  // Create sample data
  await createSampleElections();

  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
