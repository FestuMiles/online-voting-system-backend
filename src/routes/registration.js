import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authentication.js";
const router = Router();
// Route to handle user registration
router.post('/register', registerUser);
router.post('/login', loginUser);
export default router;
// This route listens for POST requests at /register and calls the registerUser controller function

