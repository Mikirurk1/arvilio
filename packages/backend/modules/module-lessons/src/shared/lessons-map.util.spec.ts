import { BadRequestException } from '@nestjs/common';
import {
  addMinutes,
  decodeLessonCursor,
  diffMinutes,
  encodeLessonCursor,
  mapLessonFileLinks,
  materialKindFromDto,
  materialKindToDto,
  recurrenceFromDto,
  recurrenceToDto,
  statusFromDto,
  statusToDto,
  studentResponseStatusFromDto,
  studentResponseStatusToDto,
} from './lessons-map.util';

describe('lessons-map.util', () => {
  it('encodeLessonCursor and decodeLessonCursor round-trip', () => {
    const row = { date: '2026-05-20', startTime: '14:00', id: 'lesson-1' };
    expect(decodeLessonCursor(encodeLessonCursor(row))).toEqual(row);
    expect(() => decodeLessonCursor('bad')).toThrow(BadRequestException);
  });

  it('addMinutes wraps within day', () => {
    expect(addMinutes('23:30', 45)).toBe('00:15');
    expect(addMinutes('bad', 10)).toBe('bad');
  });

  it('diffMinutes computes duration', () => {
    expect(diffMinutes('10:00', '11:30')).toBe(90);
    expect(diffMinutes('x', '11:00')).toBe(0);
  });

  it('status and enum mappers round-trip', () => {
    expect(statusToDto('PLANNED')).toBe('planned');
    expect(statusFromDto('completed')).toBe('COMPLETED');
    expect(recurrenceToDto('WEEKLY')).toBe('weekly');
    expect(recurrenceFromDto('daily')).toBe('DAILY');
    expect(materialKindToDto('FILE')).toBe('file');
    expect(materialKindFromDto('presentation')).toBe('PRESENTATION');
    expect(studentResponseStatusToDto('SUBMITTED')).toBe('submitted');
    expect(studentResponseStatusFromDto('needs_rework')).toBe('NEEDS_REWORK');
  });

  it('mapLessonFileLinks resolves attachment refs', () => {
    const links = mapLessonFileLinks(
      ['att:file-1', 'notes.txt'],
      [{ id: 'file-1', fileName: 'Notes.pdf' }],
      (id) => `/lessons/files/${id}`,
    );
    expect(links[0]?.downloadPath).toBe('/lessons/files/file-1');
    expect(links[0]?.fileName).toBe('Notes.pdf');
    expect(links[1]?.downloadPath).toBeNull();
  });
});
