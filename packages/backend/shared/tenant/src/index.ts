export { TenantModule } from './tenant.module';
export { TenantContextService } from './tenant-context.service';
export { TenantLoggerService } from './tenant-logger.service';
export { normalizeTenantHost, HostSchoolResolver, HOST_CACHE_TTL_MS } from './tenant-host';
export {
  TENANT_CLS_KEY,
  DEFAULT_SCHOOL_ID,
  type TenantContext,
  type MembershipRole,
  type PlatformRole,
} from './tenant-context';
