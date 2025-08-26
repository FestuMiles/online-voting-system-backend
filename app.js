import express from 'express';
import { connectDB } from './src/config/database.js';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import registrationRoutes from './src/routes/registration.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // or wherever your React app is hosted
  credentials: true, // <-- allow sending of cookies
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION SETUP

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}));

// Routes
app.use('/reg', registrationRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

connectDB().then(() => {
  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
});