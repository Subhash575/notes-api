import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { searchNotes } from "../controllers/searchController.js";

const router = Router();

// protected — must be logged in to search
router.get("/", verifyToken, searchNotes);

export default router;
