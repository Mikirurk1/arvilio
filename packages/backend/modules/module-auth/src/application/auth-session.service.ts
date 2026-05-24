import { Injectable } from '@nestjs/common';
import { PrismaService } from '@be/prisma';
import * as jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
  generateRefreshToken,
  getJwtSecret,
  hashRefreshToken,
  setAuthCookies,
} from '../shared/auth-cookies';

@Injectable()
export class AuthSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async rotateSessionFromRefreshToken(
    rawRefreshToken: string,
    meta: { userAgent?: string; ip?: string },
  ): Promise<{ userId: string; accessToken: string; refreshToken: string } | null> {
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const existing = await this.prisma.authRefreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!existing) return null;

    await this.prisma.authRefreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = jwt.sign({ sub: existing.userId }, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    });
    const refreshToken = generateRefreshToken();
    await this.prisma.authRefreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
        userAgent: meta.userAgent?.slice(0, 256) ?? null,
        ipAddress: meta.ip?.slice(0, 64) ?? null,
      },
    });

    return { userId: existing.userId, accessToken, refreshToken };
  }

  async resolveAuthenticatedUserId(
    req: Request & { cookies?: Record<string, string> },
    res?: Response,
  ): Promise<string | null> {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
    const access = bearer ?? req.cookies?.[ACCESS_COOKIE] ?? null;
    if (access) {
      try {
        const payload = jwt.verify(access, getJwtSecret()) as { sub?: string };
        if (payload?.sub) return payload.sub;
      } catch {
        // access expired — try refresh cookie
      }
    }

    const rawRefresh = req.cookies?.[REFRESH_COOKIE];
    if (!rawRefresh || !res) return null;

    const rotated = await this.rotateSessionFromRefreshToken(rawRefresh, {
      userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : undefined,
      ip: req.ip,
    });
    if (!rotated) return null;

    setAuthCookies(res, {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
    });
    return rotated.userId;
  }
}
