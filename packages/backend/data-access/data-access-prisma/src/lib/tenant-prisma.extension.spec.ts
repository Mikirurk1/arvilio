import { TENANT_SCOPED_MODELS } from './tenant-scope';
import { makeTenantExtension } from './tenant-prisma.service';

const M = 'ExtScopedModel';

function invoke(ext: ReturnType<typeof makeTenantExtension>, params: { model?: string; operation: string; args: unknown }) {
  const query = jest.fn((a: unknown) => a);
  const op = ext.query.$allModels.$allOperations as (p: unknown) => unknown;
  const result = op({ ...params, query });
  return { query, result };
}

describe('makeTenantExtension', () => {
  beforeAll(() => TENANT_SCOPED_MODELS.add(M));
  afterAll(() => TENANT_SCOPED_MODELS.delete(M));

  it('forwards scoped args to the underlying query for a tenant model', () => {
    const ext = makeTenantExtension({ getSchoolId: () => 'school_a', getIsPlatform: () => false });
    const { query } = invoke(ext, { model: M, operation: 'findMany', args: { where: { x: 1 } } });
    expect(query).toHaveBeenCalledWith({ where: { x: 1, schoolId: 'school_a' } });
  });

  it('bypasses scoping when platform flag is on', () => {
    const ext = makeTenantExtension({ getSchoolId: () => null, getIsPlatform: () => true });
    const { query } = invoke(ext, { model: M, operation: 'findMany', args: { where: {} } });
    expect(query).toHaveBeenCalledWith({ where: {} });
  });

  it('leaves non-tenant models untouched', () => {
    const ext = makeTenantExtension({ getSchoolId: () => 'school_a', getIsPlatform: () => false });
    const { query } = invoke(ext, { model: 'Language', operation: 'findMany', args: { where: { code: 'en' } } });
    expect(query).toHaveBeenCalledWith({ where: { code: 'en' } });
  });

  it('throws (fail-loud) on a tenant model with no schoolId and no bypass', () => {
    const ext = makeTenantExtension({ getSchoolId: () => null, getIsPlatform: () => false });
    expect(() => invoke(ext, { model: M, operation: 'findMany', args: {} })).toThrow('without an active schoolId');
  });
});
