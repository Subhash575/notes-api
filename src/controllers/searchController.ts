import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const searchNotes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const keyword = req.query.q;

  // --- Validation ---
  if (!keyword) {
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  if (typeof keyword !== "string") {
    res.status(400).json({ message: "Search query must be a string" });
    return;
  }

  const trimmed = keyword.trim();

  if (trimmed.length === 0) {
    res.status(400).json({ message: "Search query cannot be empty" });
    return;
  }

  if (trimmed.length < 2) {
    res
      .status(400)
      .json({ message: "Search query must be at least 2 characters" });
    return;
  }

  if (trimmed.length > 100) {
    res
      .status(400)
      .json({ message: "Search query cannot exceed 100 characters" });
    return;
  }

  try {
    const notes = await prisma.note.findMany({
      where: {
        AND: [
          // Condition 1 — keyword match in title OR content
          {
            OR: [
              { title: { contains: trimmed, mode: "insensitive" } },
              { content: { contains: trimmed, mode: "insensitive" } },
            ],
          },
          // Condition 2 — only notes I own OR notes shared with me
          {
            OR: [
              { ownerId: req.user.userId },
              { sharedWith: { some: { userId: req.user.userId } } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc", // most recently updated first
      },
    });

    // Always 200 even if empty — empty result is a valid result
    res.status(200).json(notes);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
