/**
 * Unit tests for ImportStudentsService CSV parser (via preview mocking).
 * The CSV parsing logic lives inside the service; we test it through the
 * public preview() method with a mocked prisma/tenant/entitlements.
 */

import { ImportStudentsService } from './import-students.service';

function makeService(seatsRemaining: number | null = null) {
  const tenant = { requireSchoolId: () => 'school-1', membershipRole: 'ADMIN' };
  const entitlements = {
    getSummary: jest.fn().mockResolvedValue({
      plan: 'TRIAL',
      maxActiveStudents: seatsRemaining === null ? null : 100,
      activeStudentCount: seatsRemaining === null ? 0 : 100 - seatsRemaining,
      seatsRemaining,
      features: {},
      storage: { used: 0, quota: 1000, remaining: 1000, percent: 0, over: false },
    }),
  };
  const auth = { createUserAsAdmin: jest.fn() };
  return new ImportStudentsService(
    auth as never,
    tenant as never,
    entitlements as never,
  );
}

describe('ImportStudentsService.preview', () => {
  it('parses a simple 2-row CSV', async () => {
    const svc = makeService(null);
    const result = await svc.preview('email,fullName\nalice@example.com,Alice\nbob@example.com,Bob');
    expect(result.valid).toHaveLength(2);
    expect(result.valid[0]).toMatchObject({ email: 'alice@example.com', displayName: 'Alice' });
    expect(result.invalid).toHaveLength(0);
  });

  it('skips header row when detected', async () => {
    const svc = makeService(null);
    const result = await svc.preview('Email,Name\ntest@test.com,Test');
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].email).toBe('test@test.com');
  });

  it('marks bad emails as invalid', async () => {
    const svc = makeService(null);
    const result = await svc.preview('notanemail\n,empty\nalice@ok.com,Alice');
    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toHaveLength(2);
  });

  it('detects seat-cap exceeded', async () => {
    const svc = makeService(1);
    const csv = 'a@a.com,A\nb@b.com,B\nc@c.com,C';
    const result = await svc.preview(csv);
    expect(result.valid).toHaveLength(3);
    expect(result.seatCapRemaining).toBe(1);
    expect(result.wouldExceedCap).toBe(true);
  });

  it('reports no cap when plan is unlimited', async () => {
    const svc = makeService(null);
    const result = await svc.preview('a@a.com,A');
    expect(result.seatCapRemaining).toBeNull();
    expect(result.wouldExceedCap).toBe(false);
  });

  it('handles quoted CSV cells', async () => {
    const svc = makeService(null);
    const result = await svc.preview('"alice@example.com","Alice, Smith"');
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].displayName).toBe('Alice, Smith');
  });
});
