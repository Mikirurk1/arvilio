import * as jwt from 'jsonwebtoken';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, OptionalAuthGuard, extractAccessToken, verifyAccessToken } from './auth.guard';
import { ACCESS_COOKIE, PLATFORM_ACCESS_COOKIE, getJwtSecret } from '../../shared/auth-cookies';
import { getReqRes } from '../../shared/auth-request.util';

jest.mock('../../shared/auth-request.util', () => ({
  getReqRes: jest.fn(),
}));

describe('auth.guard helpers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters';
  });

  describe('extractAccessToken', () => {
    it('reads Bearer token from Authorization header', () => {
      const token = jwt.sign({ sub: 'user-1' }, getJwtSecret());
      const req = { headers: { authorization: `Bearer ${token}` } };
      expect(extractAccessToken(req)).toBe(token);
    });

    it('reads access token from httpOnly cookie', () => {
      const token = jwt.sign({ sub: 'user-2' }, getJwtSecret());
      const req = { headers: {}, cookies: { [ACCESS_COOKIE]: token } };
      expect(extractAccessToken(req)).toBe(token);
    });

    it('prefers platform access cookie over campus cookie', () => {
      const campus = jwt.sign({ sub: 'campus' }, getJwtSecret());
      const platform = jwt.sign({ sub: 'platform' }, getJwtSecret());
      const req = {
        headers: {},
        cookies: { [ACCESS_COOKIE]: campus, [PLATFORM_ACCESS_COOKIE]: platform },
      };
      expect(extractAccessToken(req)).toBe(platform);
    });

    it('returns null when no credentials', () => {
      expect(extractAccessToken({ headers: {} })).toBeNull();
    });
  });

  describe('verifyAccessToken', () => {
    it('returns sub for a valid token', () => {
      const token = jwt.sign({ sub: 'abc-123' }, getJwtSecret(), { expiresIn: '1h' });
      expect(verifyAccessToken(token)).toEqual({ sub: 'abc-123' });
    });

    it('throws UnauthorizedException when sub is missing', () => {
      const token = jwt.sign({}, getJwtSecret(), { expiresIn: '1h' });
      expect(() => verifyAccessToken(token)).toThrow(UnauthorizedException);
    });

    it('throws for expired token', () => {
      const token = jwt.sign({ sub: 'x' }, getJwtSecret(), { expiresIn: -1 });
      expect(() => verifyAccessToken(token)).toThrow();
    });
  });
});

describe('AuthGuard', () => {
  const sessionAuth = {
    resolveAuthenticatedUserId: jest.fn(),
    resolveActiveMembership: jest.fn().mockResolvedValue(null),
    resolvePlatformRole: jest.fn().mockResolvedValue(null),
    getSchoolStatus: jest.fn().mockResolvedValue({ status: 'ACTIVE' }),
  };
  const tenant = {
    isActive: jest.fn().mockReturnValue(false),
    setUserId: jest.fn(),
    setSchoolId: jest.fn(),
    setMembershipRole: jest.fn(),
    setPlatformRole: jest.fn(),
  };
  let guard: AuthGuard;
  let optionalGuard: OptionalAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    tenant.isActive.mockReturnValue(false);
    guard = new AuthGuard(sessionAuth as never, tenant as never);
    optionalGuard = new OptionalAuthGuard(sessionAuth as never, tenant as never);
  });

  it('canActivate attaches user when session resolves', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('user-1');

    await expect(guard.canActivate({} as never)).resolves.toBe(true);
    expect(req.user).toEqual({ id: 'user-1' });
  });

  it('seeds tenant context from active membership when context is active', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('user-1');
    tenant.isActive.mockReturnValue(true);
    sessionAuth.resolveActiveMembership.mockResolvedValue({
      schoolId: 'school_a',
      role: 'TEACHER',
      schoolStatus: 'ACTIVE',
    });

    await guard.canActivate({} as never);

    expect(tenant.setUserId).toHaveBeenCalledWith('user-1');
    expect(tenant.setSchoolId).toHaveBeenCalledWith('school_a');
    expect(tenant.setMembershipRole).toHaveBeenCalledWith('TEACHER');
  });

  it('blocks members of a suspended school (403)', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('user-1');
    tenant.isActive.mockReturnValue(true);
    sessionAuth.resolveActiveMembership.mockResolvedValue({
      schoolId: 'school_a',
      role: 'TEACHER',
      schoolStatus: 'SUSPENDED',
    });

    await expect(guard.canActivate({} as never)).rejects.toThrow('suspended');
  });

  it('lets a platform operator into a suspended school (bypass)', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('op-1');
    tenant.isActive.mockReturnValue(true);
    sessionAuth.resolveActiveMembership.mockResolvedValue({
      schoolId: 'school_a',
      role: 'ADMIN',
      schoolStatus: 'SUSPENDED',
    });
    sessionAuth.resolvePlatformRole.mockResolvedValue('PLATFORM_ADMIN');

    await expect(guard.canActivate({} as never)).resolves.toBe(true);
  });

  it('seeds platformRole when the user is a platform operator', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('op-1');
    tenant.isActive.mockReturnValue(true);
    sessionAuth.resolvePlatformRole.mockResolvedValue('PLATFORM_ADMIN');

    await guard.canActivate({} as never);

    expect(tenant.setPlatformRole).toHaveBeenCalledWith('PLATFORM_ADMIN');
  });

  it('canActivate throws UnauthorizedException when anonymous', async () => {
    const req = { headers: {} };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue(null);

    await expect(guard.canActivate({} as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('canActivate propagates ForbiddenException for blocked sessions', async () => {
    const req = { headers: {} };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockRejectedValue(
      new ForbiddenException({ code: 'account_blocked', message: 'Your account is blocked.' }),
    );

    await expect(guard.canActivate({} as never)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('OptionalAuthGuard allows anonymous requests', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue(null);

    await expect(optionalGuard.canActivate({} as never)).resolves.toBe(true);
    expect(req.user).toBeUndefined();
  });

  it('OptionalAuthGuard attaches user when session resolves', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('user-2');

    await expect(optionalGuard.canActivate({} as never)).resolves.toBe(true);
    expect(req.user).toEqual({ id: 'user-2' });
  });

  describe('ADR-007 cross-school JWT check', () => {
    const SECRET = 'test-jwt-secret-at-least-32-characters';

    beforeEach(() => {
      process.env.JWT_SECRET = SECRET;
      tenant.isActive.mockReturnValue(true);
      sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('user-x');
    });

    function makeToken(schoolId: string) {
      return `Bearer ${jwt.sign({ sub: 'user-x', schoolId, membershipRole: 'STUDENT' }, SECRET, { expiresIn: 60 })}`;
    }

    it('AuthGuard throws 403 when JWT schoolId !== host schoolId', async () => {
      const req = { headers: { authorization: makeToken('school-A') } };
      (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
      // Simulate middleware having resolved 'school-B' into CLS
      Object.defineProperty(tenant, 'schoolId', { get: () => 'school-B', configurable: true });
      sessionAuth.resolveActiveMembership.mockResolvedValue(null);
      sessionAuth.resolvePlatformRole.mockResolvedValue(null);

      await expect(guard.canActivate({} as never)).rejects.toThrow('Token school does not match');
    });

    it('AuthGuard passes when JWT schoolId matches host schoolId', async () => {
      const req = { headers: { authorization: makeToken('school-A') } };
      (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
      Object.defineProperty(tenant, 'schoolId', { get: () => 'school-A', configurable: true });
      sessionAuth.resolveActiveMembership.mockResolvedValue(null);
      sessionAuth.resolvePlatformRole.mockResolvedValue(null);

      await expect(guard.canActivate({} as never)).resolves.toBe(true);
    });

    it('AuthGuard bypasses cross-check for platform operators', async () => {
      const req = { headers: { authorization: makeToken('school-A') } };
      (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
      Object.defineProperty(tenant, 'schoolId', { get: () => 'school-B', configurable: true });
      sessionAuth.resolveActiveMembership.mockResolvedValue(null);
      sessionAuth.resolvePlatformRole.mockResolvedValue('PLATFORM_ADMIN');

      await expect(guard.canActivate({} as never)).resolves.toBe(true);
    });

    it('OptionalAuthGuard strips auth on cross-school token', async () => {
      const req: { headers: Record<string, string>; user?: { id: string } } = {
        headers: { authorization: makeToken('school-A') },
      };
      (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
      Object.defineProperty(tenant, 'schoolId', { get: () => 'school-B', configurable: true });
      sessionAuth.resolveActiveMembership.mockResolvedValue(null);
      sessionAuth.resolvePlatformRole.mockResolvedValue(null);

      await expect(optionalGuard.canActivate({} as never)).resolves.toBe(true);
      expect(req.user).toBeUndefined();
    });
  });
});
