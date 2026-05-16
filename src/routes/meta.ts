import { Router } from "express";
import { about, openapi } from "../controllers/metaController.js";

const router = Router();

router.get("/about", about);
router.get("/openapi.json", openapi);

export default router;
