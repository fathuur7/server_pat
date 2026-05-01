import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: genres });
  } catch (err) {
    console.error("Fetch categories error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
