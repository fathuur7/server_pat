import { Router } from 'express';
import { upgradeToCreator } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Protected route: must be logged in to upgrade
router.put('/upgrade', protect, upgradeToCreator);

export default router;
