'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui';
import { formatSessionTime, type SessionNote } from './useSessionNotes';
import styles from './media-viewer.module.scss';

type Props = {
  notes: SessionNote[];
  onAddNote: () => void;
  onUpdateNote: (id: string, text: string) => void;
  onRemoveNote: (id: string) => void;
  onSeek: (atSec: number) => void;
};

export function SessionNotesPanel({
  notes,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onSeek,
}: Props) {
  return (
    <aside className={styles.notesPanel}>
      <div className={styles.notesPanelHead}>
        <h2 className={styles.notesTitle}>Session notes</h2>
        <Button type="button" variant="ghost" className={styles.addNoteBtn} onClick={onAddNote}>
          Add note
        </Button>
      </div>
      <p className={styles.notesBanner}>
        Notes are temporary and will not be saved after you leave.
      </p>
      {notes.length === 0 ? (
        <p className={styles.notesEmpty}>Add a note at the current playback time.</p>
      ) : (
        <ul className={styles.notesList}>
          {notes.map((note) => (
            <li key={note.id} className={styles.noteItem}>
              <Button
                variant="bare"
                type="button"
                className={styles.noteTimeBtn}
                onClick={() => onSeek(note.atSec)}
              >
                {formatSessionTime(note.atSec)}
              </Button>
              <textarea
                className={styles.noteInput}
                value={note.text}
                placeholder="Write a note…"
                rows={2}
                onChange={(event) => onUpdateNote(note.id, event.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                className={styles.noteRemoveBtn}
                aria-label="Remove note"
                onClick={() => onRemoveNote(note.id)}
              >
                <Trash2 size={14} aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
