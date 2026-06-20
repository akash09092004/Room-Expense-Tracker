import { NOTE_EDIT_WINDOW_MS } from "./constants";
import { getData, removeData, saveData } from "./storage";
import type { UserNote } from "../types";

export const buildNoteKey = (userId: string) => `user-note:${userId}`;

export const getNoteExpiry = (createdAt: string) => {
  return new Date(createdAt).getTime() + NOTE_EDIT_WINDOW_MS;
};

export const isNoteLocked = (createdAt: string) => {
  return Date.now() >= getNoteExpiry(createdAt);
};

export const loadUserNote = async (userId: string) => {
  return (await getData(buildNoteKey(userId))) as UserNote | null;
};

export const saveUserNote = async (userId: string, text: string) => {
  const key = buildNoteKey(userId);
  const existing = (await getData(key)) as UserNote | null;
  const trimmedText = text.trim();

  if (existing && isNoteLocked(existing.createdAt)) {
    throw new Error("This note is locked after 12 hours.");
  }

  if (!trimmedText) {
    await removeData(key);
    return null;
  }

  const now = new Date().toISOString();
  const note: UserNote = existing
    ? {
        ...existing,
        text: trimmedText,
        updatedAt: now,
      }
    : {
        text: trimmedText,
        createdAt: now,
        updatedAt: now,
      };

  await saveData(key, note);
  return note;
};
