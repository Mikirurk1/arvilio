import { PLAN_CATALOG, DEFAULT_PLAN_KEY, planFor } from './subscription-plans';

describe('subscription-plans', () => {
  it('resolves a known plan (case-insensitive)', () => {
    expect(planFor('PRO').key).toBe('PRO');
    expect(planFor('starter').key).toBe('STARTER');
  });

  it('falls back to the default tier for null/unknown plans', () => {
    expect(planFor(null).key).toBe(DEFAULT_PLAN_KEY);
    expect(planFor('enterprise-x').key).toBe(DEFAULT_PLAN_KEY);
  });

  it('PRO has unlimited students; TRIAL is the smallest tier', () => {
    expect(PLAN_CATALOG.PRO.maxActiveStudents).toBeNull();
    expect(PLAN_CATALOG.TRIAL.maxActiveStudents).toBeLessThan(
      PLAN_CATALOG.STARTER.maxActiveStudents as number,
    );
    expect(PLAN_CATALOG.TRIAL.storageQuotaBytes).toBeLessThan(PLAN_CATALOG.PRO.storageQuotaBytes);
  });
});
