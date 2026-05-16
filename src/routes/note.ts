import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
} from "../controllers/notesController.js";
import {
  addLink,
  getLinks,
  deleteLink,
} from "../controllers/linksController.js";

const router = Router();

// protect all note routes
router.use(verifyToken);

router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/share", shareNote);

// link routes
router.post("/:id/links", addLink);
router.get("/:id/links", getLinks);
router.delete("/:id/links/:linkId", deleteLink);

export default router;
