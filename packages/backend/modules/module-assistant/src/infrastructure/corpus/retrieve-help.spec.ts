import { ASSISTANT_CORPUS } from './assistant-corpus';
import {
  retrieveHelpChunks,
  roleToAudience,
  visibleChunks,
} from './retrieve-help';

describe('retrieveHelpChunks ACL', () => {
  it('maps roles to audiences', () => {
    expect(roleToAudience('STUDENT')).toBe('student');
    expect(roleToAudience('TEACHER')).toBe('teacher');
    expect(roleToAudience('ADMIN')).toBe('admin');
    expect(roleToAudience('SUPER_ADMIN')).toBe('admin');
  });

  it('hides admin-only finance from students but keeps shared FAQs', () => {
    const studentPool = visibleChunks('student');
    expect(studentPool.some((c) => c.id === 'nav-finance')).toBe(false);
    expect(studentPool.some((c) => c.id === 'nav-dashboard')).toBe(true);
    expect(visibleChunks('admin').some((c) => c.id === 'nav-finance')).toBe(true);
  });

  it('shows materials corpus to teachers and admins', () => {
    expect(visibleChunks('teacher').some((c) => c.id === 'nav-materials')).toBe(true);
    expect(visibleChunks('admin').some((c) => c.id === 'help-materials-facts')).toBe(
      true,
    );
    expect(visibleChunks('student').some((c) => c.id === 'nav-materials')).toBe(false);
  });

  it('retrieves calendar help for students', () => {
    const hits = retrieveHelpChunks('where is calendar schedule', 'student', 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.navHref === '/calendar' || h.id.includes('calendar'))).toBe(
      true,
    );
  });

  it('never returns teacher-only materials to students', () => {
    const hits = retrieveHelpChunks('materials library upload', 'student', 10);
    expect(hits.every((h) => h.audience.includes('student'))).toBe(true);
    expect(hits.some((h) => h.id === 'nav-materials')).toBe(false);
  });

  it('retrieves materials facts for admins', () => {
    const hits = retrieveHelpChunks('як прикріпити матеріали до уроку', 'admin', 5);
    expect(hits.some((h) => h.id === 'nav-materials' || h.id === 'help-materials-facts')).toBe(
      true,
    );
  });

  it('corpus has no curriculum answer keys', () => {
    const blob = ASSISTANT_CORPUS.map((c) => `${c.title} ${c.body}`).join('\n').toLowerCase();
    expect(blob.includes('answer key')).toBe(false);
    expect(blob.includes('correct option is')).toBe(false);
  });
});
