'use client';

import { useCallback, useState } from 'react';

export type SessionNote = {
  id: string;
  atSec: number;
  text: string;
};

function newNoteId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatSessionTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function useSessionNotes() {
  const [notes, setNotes] = useState<SessionNote[]>([]);

  const hasNotes = notes.length > 0;

  const addNote = useCallback((atSec: number) => {
    const id = newNoteId();
    setNotes((current) => [
      { id, atSec: Math.max(0, atSec), text: '' },
      ...current,
    ]);
    return id;
  }, []);

  const updateNoteText = useCallback((id: string, text: string) => {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, text } : note)));
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  const resetNotes = useCallback(() => {
    setNotes([]);
  }, []);

  return {
    notes,
    hasNotes,
    addNote,
    updateNoteText,
    removeNote,
    resetNotes,
  };
}

export function shouldConfirmLeaveSessionNotes(hasNotes: boolean): boolean {
  return hasNotes;
}
