import * as jwt from 'jsonwebtoken';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, OptionalAuthGuard, extractAccessToken, verifyAccessToken } from './auth.guard';
import { ACCESS_COOKIE, getJwtSecret } from '../../shared/auth-cookies';
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
  const sessionAuth = { resolveAuthenticatedUserId: jest.fn() };
  let guard: AuthGuard;
  let optionalGuard: OptionalAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new AuthGuard(sessionAuth as never);
    optionalGuard = new OptionalAuthGuard(sessionAuth as never);
  });

  it('canActivate attaches user when session resolves', async () => {
    const req = { headers: {} } as { user?: { id: string } };
    (getReqRes as jest.Mock).mockReturnValue({ req, res: {} });
    sessionAuth.resolveAuthenticatedUserId.mockResolvedValue('user-1');

    await expect(guard.canActivate({} as never)).resolves.toBe(true);
    expect(req.user).toEqual({ id: 'user-1' });
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
});
