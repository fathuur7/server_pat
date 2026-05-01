import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const upgradeToCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Check if already a creator
    if (user.role === 'content_creator') {
      res.status(400).json({ success: false, message: 'User is already a content creator' });
      return;
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'content_creator' },
    });

    // Generate a new token with the updated role
    const { signToken } = require('../utils/jwt');
    const token = signToken({ userId: updatedUser.id, role: updatedUser.role });

    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to content creator',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          role: updatedUser.role,
        },
        token
      },
    });
  } catch (error) {
    console.error('Upgrade role error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
