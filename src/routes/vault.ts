import { Router } from "express";
import { getVault, toggleSavedVideo } from "../controllers/vault.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protect, getVault);
router.post("/:videoId/save", protect, toggleSavedVideo);

export default router;
