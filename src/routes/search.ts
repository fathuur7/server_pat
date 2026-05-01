import { Router } from "express";
import { searchVideos } from "../controllers/search.controller";

const router = Router();

// GET /api/search?q=<query> — search across videos
router.get("/", searchVideos);

export default router;
