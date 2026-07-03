import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import {
  TENANT_CLS_KEY,
  type MembershipRole,
  type PlatformRole,
  type TenantContext,
} from './tenant-context';

/**
 * Typed accessor over the CLS store for the per-request `TenantContext`.
 *
 * Inject this anywhere instead of threading `schoolId`/`userId` through method
 * signatures. All getters are safe to call inside a request (or any `cls.run`);
 * outside an active context they return null (use `isActive()` to check).
 */
@Injectable()
export class TenantContextService {
  constructor(private readonly cls: ClsService) {}

  /** Whether a CLS context is currently active (a request or `cls.run`). */
  isActive(): boolean {
    return this.cls.isActive();
  }

  private ctx(): TenantContext {
    const existing = this.cls.get<TenantContext | undefined>(TENANT_CLS_KEY);
    if (existing) return existing;
    const fresh: TenantContext = {};
    this.cls.set(TENANT_CLS_KEY, fresh);
    return fresh;
  }

  get requestId(): string | null {
    return this.cls.isActive() ? (this.ctx().requestId ?? null) : null;
  }

  get schoolId(): string | null {
    return this.cls.isActive() ? (this.ctx().schoolId ?? null) : null;
  }

  get userId(): string | null {
    return this.cls.isActive() ? (this.ctx().userId ?? null) : null;
  }

  get membershipRole(): MembershipRole | null {
    return this.cls.isActive() ? (this.ctx().membershipRole ?? null) : null;
  }

  get platformRole(): PlatformRole | null {
    return this.cls.isActive() ? (this.ctx().platformRole ?? null) : null;
  }

  setRequestId(id: string): void {
    this.ctx().requestId = id;
  }

  setSchoolId(id: string | null): void {
    this.ctx().schoolId = id;
  }

  setUserId(id: string | null): void {
    this.ctx().userId = id;
  }

  setMembershipRole(role: MembershipRole | null): void {
    this.ctx().membershipRole = role;
  }

  get locale(): string | null {
    return this.cls.isActive() ? (this.ctx().locale ?? null) : null;
  }

  setPlatformRole(role: PlatformRole | null): void {
    this.ctx().platformRole = role;
  }

  setLocale(locale: string | null): void {
    this.ctx().locale = locale;
  }

  /**
   * Return the active tenant id or throw. Tenant-scoped data access (Phase 1
   * `TenantPrismaService`) relies on this to fail loudly rather than leak across
   * tenants when the context was never established.
   */
  requireSchoolId(): string {
    const id = this.schoolId;
    if (!id) {
      throw new Error(
        'Tenant context: schoolId is not set (no active tenant). ' +
          'Public/platform code must use the explicit asPlatform() path.',
      );
    }
    return id;
  }

  /** Shallow copy of the current context (for logging/debugging). */
  snapshot(): TenantContext {
    return this.cls.isActive() ? { ...this.ctx() } : {};
  }
}
