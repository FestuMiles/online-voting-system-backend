import { Router } from "express";
import getAllUsers, {
  deleteUser,
  getTotalNumberOfUsers,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/usersManagement.js";
import { isLoggedIn } from "../middlewares/authentication.js";
import { isAdmin } from "../middlewares/authentication.js";
const router = Router();
// Route to get all users
router.get("/all", isLoggedIn, isAdmin, getAllUsers);
router.delete("/delete/:id", isLoggedIn, isAdmin, deleteUser);
router.get("/total", isLoggedIn, isAdmin, getTotalNumberOfUsers);
router.get("/me", isLoggedIn, getCurrentUser);
router.put("/me", isLoggedIn, updateCurrentUser);

export default router;
// This route listens for GET requests at /all and calls the getAllUsers controller function
// It is protected by the isLoggedIn middleware to ensure only authenticated users can access it
