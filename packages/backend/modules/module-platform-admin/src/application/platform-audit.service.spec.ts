import type { PrismaService } from '@be/prisma';
import type { TenantContextService } from '@be/tenant';
import { PlatformAuditService } from './platform-audit.service';

describe('PlatformAuditService', () => {
  const create = jest.fn();
  const prisma = { platformAuditLog: { create } } as unknown as PrismaService;

  beforeEach(() => jest.clearAllMocks());

  function service(userId: string | null) {
    const tenant = { userId } as unknown as TenantContextService;
    return new PlatformAuditService(prisma, tenant);
  }

  it('records the action attributed to the current operator', async () => {
    await service('op-1').record({ action: 'school.suspend', targetSchoolId: 'school_a' });
    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'op-1',
        action: 'school.suspend',
        targetSchoolId: 'school_a',
        metadata: undefined,
        ip: null,
      },
    });
  });

  it('no-ops when there is no authenticated actor', async () => {
    await service(null).record({ action: 'school.suspend' });
    expect(create).not.toHaveBeenCalled();
  });
});
