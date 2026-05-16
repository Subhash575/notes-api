import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// helper — checks note exists and user has access
const verifyNoteAccess = async (
  noteId: number,
  userId: number,
  ownerOnly = false,
) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ...(ownerOnly
        ? { ownerId: userId } // only owner
        : {
            OR: [
              { ownerId: userId },
              { sharedWith: { some: { userId } } }, // owner or shared
            ],
          }),
    },
  });
  return note;
};

// ─── POST /notes/:id/links ────────────────────────────────────
export const addLink = async (req: Request, res: Response): Promise<void> => {
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

  const { url, label } = req.body;

  if (!url) {
    res.status(400).json({ message: "URL is required" });
    return;
  }

  // basic URL validation
  try {
    new URL(url); // throws if invalid URL
  } catch {
    res.status(400).json({ message: "Invalid URL format" });
    return;
  }

  if (label && typeof label !== "string") {
    res.status(400).json({ message: "Label must be a string" });
    return;
  }

  if (label && label.trim().length === 0) {
    res.status(400).json({ message: "Label cannot be empty" });
    return;
  }

  try {
    // only owner can add links
    const note = await verifyNoteAccess(noteId, req.user.userId, true);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    // max 10 links per note — practical limit
    const linkCount = await prisma.noteLink.count({ where: { noteId } });
    if (linkCount >= 10) {
      res.status(400).json({ message: "Maximum 10 links per note allowed" });
      return;
    }

    const link = await prisma.noteLink.create({
      data: {
        url,
        label: label?.trim() || null,
        noteId,
      },
    });

    res.status(201).json(link);
  } catch (err) {
    console.error("Add link error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// This endpoint is used to get all links that belong to a specific note.
// ─── GET /notes/:id/links ─────────────────────────────────────
export const getLinks = async (req: Request, res: Response): Promise<void> => {
  const noteId = Number(req.params.id);

  if (!Number.isInteger(noteId)) {
    res.status(400).json({
      message: "Invalid note ID",
    });
    return;
  }

  try {
    // owner OR shared user can view links
    const note = await verifyNoteAccess(noteId, req.user.userId, false);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    const links = await prisma.noteLink.findMany({
      where: { noteId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(links);
  } catch (err) {
    console.error("Get links error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── DELETE /notes/:id/links/:linkId ─────────────────────────
export const deleteLink = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id1 = req.params.id;

  if (typeof id1 !== "string") {
    res.status(400).json({
      message: "Invalid ID",
    });
    return;
  }
  const noteId = parseInt(id1);

  const id2 = req.params.linkId;
  if (typeof id2 !== "string") {
    res.status(400).json({
      message: "Invalid ID",
    });
    return;
  }
  const linkId = parseInt(id2);

  if (isNaN(noteId) || isNaN(linkId)) {
    res.status(400).json({ message: "Invalid note ID or link ID" });
    return;
  }

  try {
    // only owner can delete links
    const note = await verifyNoteAccess(noteId, req.user.userId, true);
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    const link = await prisma.noteLink.findFirst({
      where: {
        id: linkId,
        noteId, // make sure link belongs to this note
      },
    });

    if (!link) {
      res.status(404).json({ message: "Link not found" });
      return;
    }

    await prisma.noteLink.delete({ where: { id: linkId } });

    res.status(204).send();
  } catch (err) {
    console.error("Delete link error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
