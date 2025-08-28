import { Router } from "express";
import getAllUsers from "../controllers/usersManagement.js";
import { isLoggedIn } from "../middlewares/authentication.js";
import { isAdmin } from "../middlewares/authentication.js";
const router = Router();
// Route to get all users
router.get('/all',isLoggedIn,isAdmin, getAllUsers);
export default router;
// This route listens for GET requests at /all and calls the getAllUsers controller function
// It is protected by the isLoggedIn middleware to ensure only authenticated users can access it
