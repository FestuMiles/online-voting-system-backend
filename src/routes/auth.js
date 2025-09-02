import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authentication.js";
import { isLoggedIn } from "../middlewares/authentication.js";
const router = Router();
// Route to handle user registration
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', isLoggedIn, logoutUser);
export default router;
// This route listens for POST requests at /register and calls the registerUser controller function

