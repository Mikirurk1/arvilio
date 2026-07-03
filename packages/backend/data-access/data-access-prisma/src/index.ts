export * from './lib/be-prisma';
export { TenantPrismaService, makeTenantExtension, PLATFORM_BYPASS_KEY } from './lib/tenant-prisma.service';
export { TENANT_SCOPED_MODELS, isTenantModel, scopeArgs } from './lib/tenant-scope';
