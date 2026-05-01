import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

import { prisma } from '../utils/prisma';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    // Check if user actually exists (in case database was reset)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const isCreator = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'content_creator') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as a content creator' });
  }
};
