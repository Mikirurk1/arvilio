/**
 * Per-role auth state paths.
 * Setup project (setup/auth.setup.ts) logs in once and writes .auth/*.json.
 * Specs use: test.use({ storageState: STATE.student })
 */
import * as path from 'node:path';
import { test, expect } from '@playwright/test';

export const AUTH_DIR = path.resolve(__dirname, '../.auth');

export const STATE = {
  student: path.join(AUTH_DIR, 'student.json'),
  teacher: path.join(AUTH_DIR, 'teacher.json'),
  admin: path.join(AUTH_DIR, 'admin.json'),
  studentEmpty: path.join(AUTH_DIR, 'student-empty.json'),
  teacherEmpty: path.join(AUTH_DIR, 'teacher-empty.json'),
} as const;

export type Role = keyof typeof STATE;

export { test, expect };
