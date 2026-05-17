import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { ACCESS_COOKIE, getJwtSecret } from './auth-cookies';
import { getReqRes } from './auth-request.util';
import { AuthSessionService } from './auth-session.service';

export type AuthenticatedRequest = Request & {
  cookies?: Record<string, string>;
  user?: { id: string };
};

export function extractAccessToken(req: AuthenticatedRequest): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  const cookie = req.cookies?.[ACCESS_COOKIE];
  if (cookie) return cookie;
  return null;
}

export function verifyAccessToken(token: string): { sub: string } {
  const payload = jwt.verify(token, getJwtSecret()) as { sub?: string };
  if (!payload?.sub) throw new UnauthorizedException();
  return { sub: payload.sub };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionAuth: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = getReqRes(context);
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req, res);
    if (!userId) throw new UnauthorizedException();
    req.user = { id: userId };
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly sessionAuth: AuthSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = getReqRes(context);
    const userId = await this.sessionAuth.resolveAuthenticatedUserId(req, res);
    if (userId) req.user = { id: userId };
    return true;
  }
}
