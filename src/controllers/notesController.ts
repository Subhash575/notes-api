import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ─── GET /notes ───────────────────────────────────────────────
// Returns all notes owned by OR shared with the authenticated user
export const getAllNotes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  // --- Parse query params ---
  const pageParam = req.query.page as string | undefined;
  const limitParam = req.query.limit as string | undefined;

  // --- Defaults ---
  const page = pageParam ? parseInt(pageParam) : 1;
  const limit = limitParam ? parseInt(limitParam) : 10;

  // --- Validation ---
  if (isNaN(page) || page < 1) {
    res.status(400).json({ message: "Page must be a positive number" });
    return;
  }

  if (isNaN(limit) || limit < 1) {
    res.status(400).json({ message: "Limit must be a positive number" });
    return;
  }

  if (limit > 100) {
    res.status(400).json({ message: "Limit cannot exceed 100" });
    return;
  }

  // --- Offset calculation ---
  const offset = (page - 1) * limit;

  try {
    // Run both queries in parallel — faster than sequential
    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: {
          OR: [
            { ownerId: req.user.userId },
            { sharedWith: { some: { userId: req.user.userId } } },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit, // ← LIMIT in SQL
        skip: offset, // ← OFFSET in SQL
      }),

      // Count total matching notes — needed for totalPages
      prisma.note.count({
        where: {
          OR: [
            { ownerId: req.user.userId },
            { sharedWith: { some: { userId: req.user.userId } } },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: notes,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error("Get all notes error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET /notes/:id ───────────────────────────────────────────
export const getNoteById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({
      message: "Invalid ID",
    });
    return;
  }
  const noteId = parseInt(id);

  // validate id is a number
  if (isNaN(noteId)) {
    res.status(400).json({ message: "Invalid note ID" });
    return;
  }

  try {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        OR: [
          { ownerId: req.user.userId },
          { sharedWith: { some: { userId: req.user.userId } } },
        ],
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return 404 whether note doesn't exist OR user has no access
    // Never reveal that a note exists but they can't access it
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    res.status(200).json(note);
  } catch (err) {
    console.error("Get note error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── POST /notes ──────────────────────────────────────────────
export const createNote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "Title and content are required" });
    return;
  }

  if (typeof title !== "string" || typeof content !== "string") {
    res.status(400).json({ message: "Title and content must be strings" });
    return;
  }

  if (title.trim().length === 0) {
    res.status(400).json({ message: "Title cannot be empty" });
    return;
  }

  if (content.trim().length === 0) {
    // content trim
    res.status(400).json({ message: "Content cannot be empty" });
    return;
  }

  try {
    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(), // ← trim this too
        ownerId: req.user.userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Create note error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── PUT /notes/:id ───────────────────────────────────────────
export const updateNote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({
      message: "Invalid ID",
    });
    return;
  }
  const noteId = parseInt(id);

  if (isNaN(noteId)) {
    res.status(400).json({ message: "Invalid note ID" });
    return;
  }

  const { title, content } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "Title and content are required" });
    return;
  }

  if (title.trim().length === 0) {
    res.status(400).json({ message: "Title cannot be empty" });
    return;
  }

  if (content.trim().length === 0) {
    res.status(400).json({ message: "Content cannot be empty" });
    return;
  }

  try {
    // First check — does this note exist AND does this user own it?
    // Only owner can update, not someone it's shared with
    const existing = await prisma.note.findFirst({
      where: {
        id: noteId,
        ownerId: req.user.userId, // strict ownership check
      },
    });

    if (!existing) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: title.trim(),
        content: content.trim(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update note error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE /notes/:id ────────────────────────────────────────
export const deleteNote = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({
      message: "Invalid ID",
    });
    return;
  }
  const noteId = parseInt(id);

  if (isNaN(noteId)) {
    res.status(400).json({ message: "Invalid note ID" });
    return;
  }

  try {
    // Only owner can delete
    const existing = await prisma.note.findFirst({
      where: {
        id: noteId,
        ownerId: req.user.userId,
      },
    });

    if (!existing) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    await prisma.note.delete({ where: { id: noteId } });

    // 204 means success with no response body
    res.status(204).send();
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── POST /notes/:id/share ────────────────────────────────────
export const shareNote = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({
      message: "Invalid ID",
    });
    return;
  }
  const noteId = parseInt(id);

  if (isNaN(noteId)) {
    res.status(400).json({ message: "Invalid note ID" });
    return;
  }

  const { share_with_email } = req.body;

  if (!share_with_email) {
    res.status(400).json({ message: "share_with_email is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(share_with_email)) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  try {
    // Only owner can share
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        ownerId: req.user.userId,
      },
    });

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    // Can't share with yourself
    if (share_with_email === req.user.email) {
      res
        .status(400)
        .json({ message: "You cannot share a note with yourself" });
      return;
    }

    // Target user must exist
    const targetUser = await prisma.user.findUnique({
      where: { email: share_with_email },
    });

    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // upsert — sharing twice is a no-op, not an error
    await prisma.noteShare.upsert({
      where: {
        noteId_userId: {
          noteId,
          userId: targetUser.id,
        },
      },
      update: {}, // already shared, do nothing
      create: {
        noteId,
        userId: targetUser.id,
      },
    });

    res.status(200).json({ message: "Note shared successfully" });
  } catch (err) {
    console.error("Share note error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
