import { ClsServiceManager } from 'nestjs-cls';
import { TENANT_CLS_KEY } from '@be/tenant';
import {
  getPlatformIntegrationRuntime,
  refreshPlatformIntegrationRuntime,
  resetPlatformIntegrationRuntimeFromEnv,
  invalidatePlatformIntegrationRuntime,
} from './platform-integration.runtime';

/**
 * G3: the integration runtime cache must be keyed per school (not a process-wide
 * singleton), with a platform-global fallback — so one school's resolved
 * config/secrets never leak into another's.
 */
describe('platform-integration.runtime (G3 per-tenant cache)', () => {
  const cls = ClsServiceManager.getClsService();

  const runInSchool = <T>(schoolId: string | null, fn: () => T): T =>
    cls.run(() => {
      cls.set(TENANT_CLS_KEY, { schoolId });
      return fn();
    });

  beforeEach(() => {
    resetPlatformIntegrationRuntimeFromEnv();
  });

  it('returns the platform-global entry when no school-specific config exists', () => {
    const global = getPlatformIntegrationRuntime();
    const inSchool = runInSchool('school_a', () => getPlatformIntegrationRuntime());
    expect(inSchool).toBe(global);
  });

  it('returns the per-school entry inside that school’s context', () => {
    const schoolA = refreshPlatformIntegrationRuntime({}, {}, 'school_a');
    const global = getPlatformIntegrationRuntime();
    expect(schoolA).not.toBe(global);

    expect(runInSchool('school_a', () => getPlatformIntegrationRuntime())).toBe(schoolA);
    // school_b has no entry → platform-global fallback (no cross-tenant leak).
    expect(runInSchool('school_b', () => getPlatformIntegrationRuntime())).toBe(global);
    // Outside any context → platform-global.
    expect(getPlatformIntegrationRuntime()).toBe(global);
  });

  it('invalidates a school entry back to the platform-global fallback', () => {
    refreshPlatformIntegrationRuntime({}, {}, 'school_a');
    invalidatePlatformIntegrationRuntime('school_a');
    const global = getPlatformIntegrationRuntime();
    expect(runInSchool('school_a', () => getPlatformIntegrationRuntime())).toBe(global);
  });
});
