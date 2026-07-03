import { Test } from '@nestjs/testing';
import { ClsModule, ClsService } from 'nestjs-cls';
import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  let cls: ClsService;
  let svc: TenantContextService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ClsModule.forRoot()],
      providers: [TenantContextService],
    }).compile();
    cls = moduleRef.get(ClsService);
    svc = moduleRef.get(TenantContextService);
  });

  it('stores and reads tenant values within a context', () => {
    cls.run(() => {
      svc.setSchoolId('school_a');
      svc.setUserId('user_1');
      svc.setMembershipRole('TEACHER');
      svc.setPlatformRole(null);

      expect(svc.schoolId).toBe('school_a');
      expect(svc.requireSchoolId()).toBe('school_a');
      expect(svc.userId).toBe('user_1');
      expect(svc.membershipRole).toBe('TEACHER');
      expect(svc.snapshot()).toEqual(
        expect.objectContaining({ schoolId: 'school_a', userId: 'user_1' }),
      );
    });
  });

  it('isolates context between separate runs (no cross-tenant bleed)', () => {
    cls.run(() => svc.setSchoolId('school_a'));
    cls.run(() => {
      expect(svc.schoolId).toBeNull();
    });
  });

  it('requireSchoolId throws when no tenant is set', () => {
    cls.run(() => {
      expect(() => svc.requireSchoolId()).toThrow('schoolId is not set');
    });
  });

  it('returns null and is inactive outside any context', () => {
    expect(svc.isActive()).toBe(false);
    expect(svc.schoolId).toBeNull();
    expect(svc.userId).toBeNull();
    expect(svc.snapshot()).toEqual({});
  });
});
