import { TENANT_SCOPED_MODELS, isTenantModel, scopeArgs } from './tenant-scope';

const M = 'ScopedTestModel';

describe('tenant-scope', () => {
  beforeAll(() => TENANT_SCOPED_MODELS.add(M));
  afterAll(() => TENANT_SCOPED_MODELS.delete(M));

  const base = { model: M, schoolId: 'school_a', isPlatform: false };

  it('flags only registered models as tenant-scoped', () => {
    expect(isTenantModel(M)).toBe(true);
    expect(isTenantModel('Language')).toBe(false);
    expect(isTenantModel(undefined)).toBe(false);
  });

  it('injects schoolId into where for reads', () => {
    const out = scopeArgs({ ...base, operation: 'findMany', args: { where: { active: true } } }) as any;
    expect(out.where).toEqual({ active: true, schoolId: 'school_a' });
  });

  it('adds where when args/where missing', () => {
    const out = scopeArgs({ ...base, operation: 'findFirst', args: undefined }) as any;
    expect(out.where).toEqual({ schoolId: 'school_a' });
  });

  it('stamps schoolId into create data', () => {
    const out = scopeArgs({ ...base, operation: 'create', args: { data: { name: 'x' } } }) as any;
    expect(out.data).toEqual({ schoolId: 'school_a', name: 'x' });
  });

  it('stamps schoolId into every row of createMany', () => {
    const out = scopeArgs({
      ...base,
      operation: 'createMany',
      args: { data: [{ name: 'a' }, { name: 'b' }] },
    }) as any;
    expect(out.data).toEqual([
      { schoolId: 'school_a', name: 'a' },
      { schoolId: 'school_a', name: 'b' },
    ]);
  });

  it('scopes both where and create on upsert', () => {
    const out = scopeArgs({
      ...base,
      operation: 'upsert',
      args: { where: { id: '1' }, create: { name: 'x' }, update: { name: 'y' } },
    }) as any;
    expect(out.where).toEqual({ id: '1', schoolId: 'school_a' });
    expect(out.create).toEqual({ schoolId: 'school_a', name: 'x' });
    expect(out.update).toEqual({ name: 'y' });
  });

  it('scopes unique ops (update/delete) by schoolId', () => {
    const out = scopeArgs({ ...base, operation: 'update', args: { where: { id: '1' }, data: { n: 1 } } }) as any;
    expect(out.where).toEqual({ id: '1', schoolId: 'school_a' });
  });

  it('does NOT touch non-tenant models', () => {
    const args = { where: { code: 'en' } };
    expect(scopeArgs({ model: 'Language', operation: 'findMany', args, schoolId: 'school_a', isPlatform: false })).toBe(args);
  });

  it('bypasses scoping under asPlatform', () => {
    const args = { where: {} };
    expect(scopeArgs({ ...base, operation: 'findMany', args, isPlatform: true })).toBe(args);
  });

  it('FAILS LOUD on a tenant model with no active schoolId (no platform bypass)', () => {
    expect(() =>
      scopeArgs({ model: M, operation: 'findMany', args: {}, schoolId: null, isPlatform: false }),
    ).toThrow('without an active schoolId');
  });

  it('does not mutate the original args', () => {
    const args = { where: { a: 1 } };
    scopeArgs({ ...base, operation: 'findMany', args });
    expect(args).toEqual({ where: { a: 1 } });
  });
});
