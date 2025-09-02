import { Router } from "express";
import { isAdmin,isLoggedIn } from "../middlewares/authentication.js";
import { getSettings, updateSettings } from "../controllers/settings.js";

const router = Router();

// Admin route to get current settings
router.get("/settings", isLoggedIn, isAdmin, getSettings);
// Admin route to update settings
router.patch("/settings", isLoggedIn, isAdmin, updateSettings);

export default router;
// This route listens for GET requests at /settings and calls the getSettings controller function
// It is protected by the isLoggedIn and isAdmin middlewares to ensure only authenticated admin users can access it