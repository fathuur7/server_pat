import { Router } from "express";
import { getCategories } from "../controllers/categories.controller";

const router = Router();

// GET /api/categories — list all categories
router.get("/", getCategories);

export default router;
