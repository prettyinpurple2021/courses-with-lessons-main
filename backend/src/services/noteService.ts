import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Note {
  id: string;
  content: string;
  timestamp: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteData {
  content: string;
  timestamp?: number;
}

export interface UpdateNoteData {
  content?: string;
  timestamp?: number;
}

/**
 * Get all notes for a lesson by a specific user
 */
export async function getNotesByLesson(userId: string, lessonId: string): Promise<Note[]> {
  const notes = await prisma.note.findMany({
    where: {
      userId,
      lessonId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      content: true,
      timestamp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return notes;
}

/**
 * Get a specific note by ID
 */
export async function getNoteById(userId: string, noteId: string): Promise<Note | null> {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
    select: {
      id: true,
      content: true,
      timestamp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return note;
}

/**
 * Create a new note for a lesson
 */
export async function createNote(
  userId: string,
  lessonId: string,
  data: CreateNoteData
): Promise<Note> {
  const note = await prisma.note.create({
    data: {
      userId,
      lessonId,
      content: data.content,
      timestamp: data.timestamp || null,
    },
    select: {
      id: true,
      content: true,
      timestamp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return note;
}

/**
 * Update an existing note
 */
export async function updateNote(
  userId: string,
  noteId: string,
  data: UpdateNoteData
): Promise<Note | null> {
  // First verify the note belongs to the user
  const existingNote = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!existingNote) {
    return null;
  }

  const note = await prisma.note.update({
    where: {
      id: noteId,
    },
    data: {
      content: data.content,
      timestamp: data.timestamp !== undefined ? data.timestamp : undefined,
    },
    select: {
      id: true,
      content: true,
      timestamp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return note;
}

/**
 * Delete a note
 */
export async function deleteNote(userId: string, noteId: string): Promise<boolean> {
  // First verify the note belongs to the user
  const existingNote = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!existingNote) {
    return false;
  }

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });

  return true;
}

/**
 * Auto-save or update note (upsert-like behavior)
 * This is useful for auto-save functionality where we want to update
 * the most recent note if it exists, or create a new one
 */
export async function autoSaveNote(
  userId: string,
  lessonId: string,
  data: CreateNoteData
): Promise<Note> {
  // For auto-save, we'll just create a new note each time
  // The frontend can handle merging or updating specific notes
  return createNote(userId, lessonId, data);
}

/**
 * Upsert note by ID (for auto-save with specific note ID)
 * If noteId is provided and exists, update it. Otherwise create new note.
 */
export async function upsertNote(
  userId: string,
  lessonId: string,
  noteId: string | null,
  data: CreateNoteData
): Promise<Note> {
  if (noteId) {
    // Try to update existing note
    const existingNote = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
        lessonId,
      },
    });

    if (existingNote) {
      return await prisma.note.update({
        where: { id: noteId },
        data: {
          content: data.content,
          timestamp: data.timestamp !== undefined ? data.timestamp : existingNote.timestamp,
        },
        select: {
          id: true,
          content: true,
          timestamp: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }
  }

  // Create new note if noteId not provided or note doesn't exist
  return createNote(userId, lessonId, data);
}

/**
 * Get note draft (most recent unsaved note for a lesson)
 * This can be used to retrieve drafts stored locally
 */
export async function getNoteDraft(
  userId: string,
  lessonId: string
): Promise<Note | null> {
  const note = await prisma.note.findFirst({
    where: {
      userId,
      lessonId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      content: true,
      timestamp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return note;
}

/**
 * Resolve note conflicts by comparing timestamps
 * Returns the note with the most recent update
 */
export async function resolveNoteConflict(
  userId: string,
  noteId: string,
  clientContent: string,
  clientTimestamp: Date
): Promise<{ resolved: Note; hadConflict: boolean }> {
  const serverNote = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });

  if (!serverNote) {
    throw new Error('Note not found');
  }

  const serverTime = new Date(serverNote.updatedAt);
  const clientTime = new Date(clientTimestamp);

  // If server has newer data, return server version
  if (serverTime > clientTime) {
    return {
      resolved: {
        id: serverNote.id,
        content: serverNote.content,
        timestamp: serverNote.timestamp,
        createdAt: serverNote.createdAt,
        updatedAt: serverNote.updatedAt,
      },
      hadConflict: true,
    };
  }

  // If client has newer data, update server
  const updatedNote = await prisma.note.update({
    where: { id: noteId },
    data: {
      content: clientContent,
    },
    select: {
      id: true,
      content: true,
      timestamp: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    resolved: updatedNote,
    hadConflict: serverTime.getTime() !== clientTime.getTime(),
  };
}
