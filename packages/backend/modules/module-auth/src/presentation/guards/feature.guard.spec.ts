import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { TenantContextService } from '@be/tenant';
import type { EntitlementsService } from '@be/billing/entitlements';
import { FeatureGuard } from './feature.guard';

describe('FeatureGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const entitlements = { assertFeature: jest.fn() };
  const tenant = { requireSchoolId: jest.fn(() => 's1') };
  const guard = new FeatureGuard(
    reflector as unknown as Reflector,
    entitlements as unknown as EntitlementsService,
    tenant as unknown as TenantContextService,
  );

  const ctx = {
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;

  beforeEach(() => jest.clearAllMocks());

  it('passes through when no @RequiresFeature metadata', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(entitlements.assertFeature).not.toHaveBeenCalled();
  });

  it('asserts the feature for the current school when required', async () => {
    reflector.getAllAndOverride.mockReturnValue('customDomain');
    entitlements.assertFeature.mockResolvedValue(undefined);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(entitlements.assertFeature).toHaveBeenCalledWith('s1', 'customDomain');
  });

  it('propagates ForbiddenException when the plan lacks the feature', async () => {
    reflector.getAllAndOverride.mockReturnValue('aiAssist');
    entitlements.assertFeature.mockRejectedValue(new ForbiddenException());
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
