import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@be/prisma';
import {
  PLATFORM_BILLING_RAIL_CATALOG,
  platformRailById,
  pricingModeForRail,
  type PlatformRailId,
} from '../shared/platform-billing-rails.catalog';
import {
  decryptPlatformBillingSecrets,
  encryptPlatformBillingSecrets,
  mergePlatformBillingSecrets,
  type PlatformRailSecretsMap,
} from '../shared/platform-billing-rails.secrets';
import { getPlatformStripeClient } from '../infrastructure/stripe.client';
import {
  CAMPUS_SUBSCRIPTION_PRODUCT,
  coerceCampusSubscriptionRails,
  normalizeBillingCountryInput,
  parseCampusSubscriptionInput,
  readCampusSubscriptionProduct,
  resolveOfferFromProduct,
  type CampusSubscriptionProductConfig,
  type PlatformBillingStoredConfig,
  type ResolvedCampusSubscriptionOffer,
} from '../shared/platform-billing-products';

const SETTINGS_ID = 'default';

export type PlatformBillingRailSecretStatus = {
  configured: boolean;
  source: 'system' | 'env' | 'missing';
};

export type PlatformBillingRailDto = {
  id: PlatformRailId;
  title: string;
  description: string;
  /** Capability hint only — pricing policy lives on campus_subscription product. */
  regions: string[];
  brandBg: string;
  brandFg: string;
  enabled: boolean;
  /** All required secrets present (DB or env). */
  configured: boolean;
  config: Record<string, string>;
  configFields: Array<{ key: string; label: string; placeholder?: string }>;
  secretFields: Array<{
    key: string;
    label: string;
    status: PlatformBillingRailSecretStatus;
  }>;
};

export type PlatformBillingRailsDto = {
  rails: PlatformBillingRailDto[];
  /** Single default rail for campus subscription offers without a country override. */
  defaultRailId: string;
};

export type CampusSubscriptionProductDto = CampusSubscriptionProductConfig & {
  /** Enabled + configured rails only (for Campus plans selectors). */
  availableRails: Array<{ id: string; title: string; pricingMode: 'stripe' | 'amount' }>;
};

export type PlatformRailTestResult = {
  ok: boolean;
  message: string;
};

export type ResolvedPlatformStripeConfig = {
  secretKey: string | null;
  webhookSecret: string | null;
  /** Legacy global price IDs (env / rail config) — prefer resolveCampusSubscriptionOffer. */
  priceStarter: string | null;
  pricePro: string | null;
  enabled: boolean;
};

/**
 * Platform-owned billing rails + Layer-B campus subscription product (ADR-010).
 * Control Plane Billing UI; checkout resolves offer from School.billingCountry.
 */
@Injectable()
export class PlatformBillingRailsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRails(): Promise<PlatformBillingRailsDto> {
    const { storedConfig, secrets } = await this.loadRow();
    const rails = PLATFORM_BILLING_RAIL_CATALOG.map((def) => {
      const row = storedConfig.rails?.[def.id];
      const enabled = row?.enabled ?? def.id === 'stripe_platform';
      const config = this.cleanStringMap(row?.config);
      const railSecrets = secrets[def.id] ?? {};
      const secretFields = def.secretFields.map((f) => ({
        key: f.key,
        label: f.label,
        status: this.secretFieldStatus(def.id, f.key, railSecrets[f.key]),
      }));
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        regions: [...def.regions],
        brandBg: def.brandBg,
        brandFg: def.brandFg,
        enabled,
        configured: secretFields.every((f) => f.status.configured),
        config,
        configFields: def.configFields.filter(
          (f) => f.key !== 'priceStarter' && f.key !== 'pricePro',
        ),
        secretFields,
      };
    });
    return {
      rails,
      defaultRailId: this.resolveDefaultRailId(storedConfig, rails),
    };
  }

  /** @deprecated Prefer getRails — kept for legacy GET billing-rails. */
  async get(): Promise<PlatformBillingRailsDto & { defaultRegion: string }> {
    const rails = await this.getRails();
    return { ...rails, defaultRegion: 'UA' };
  }

  async setRails(body: {
    defaultRailId?: string;
    rails?: Array<{
      id: string;
      enabled?: boolean;
      config?: Record<string, string>;
      secrets?: Record<string, string>;
    }>;
  }): Promise<PlatformBillingRailsDto> {
    const updates = body.rails ?? [];
    for (const item of updates) {
      if (!platformRailById(item.id)) {
        throw new BadRequestException(`Unknown platform billing rail: ${item.id}`);
      }
    }
    if (body.defaultRailId != null && !platformRailById(body.defaultRailId)) {
      throw new BadRequestException(`Unknown default rail: ${body.defaultRailId}`);
    }

    const { storedConfig, secrets, encryptedPayload } = await this.loadRow();
    const nextRails = { ...(storedConfig.rails ?? {}) };
    let secretUpdates: PlatformRailSecretsMap = {};

    for (const item of updates) {
      const prev = nextRails[item.id] ?? {};
      const nextConfig = {
        ...this.cleanStringMap(prev.config),
        ...this.cleanStringMap(item.config),
      };
      delete nextConfig.priceStarter;
      delete nextConfig.pricePro;
      nextRails[item.id] = {
        enabled: item.enabled ?? prev.enabled ?? item.id === 'stripe_platform',
        config: nextConfig,
      };
      if (item.secrets && Object.keys(item.secrets).length > 0) {
        secretUpdates[item.id] = this.cleanStringMap(item.secrets);
      }
    }

    let nextEncrypted = encryptedPayload;
    if (Object.keys(secretUpdates).length > 0) {
      const key = this.encryptionKey();
      if (!key) {
        throw new BadRequestException(
          'Set PLATFORM_SECRETS_ENCRYPTION_KEY (or PAYMENT_SECRETS_ENCRYPTION_KEY) to save platform billing secrets',
        );
      }
      const merged = mergePlatformBillingSecrets(secrets, secretUpdates);
      nextEncrypted = encryptPlatformBillingSecrets(merged, key);
    }

    const defaultRailId =
      body.defaultRailId?.trim() ||
      storedConfig.defaultRailId ||
      storedConfig.products?.campus_subscription?.default?.railId ||
      'stripe_platform';

    if (nextRails[defaultRailId]?.enabled === false) {
      throw new BadRequestException('Default rail must be enabled');
    }

    const product = readCampusSubscriptionProduct(storedConfig);
    const nextProduct: CampusSubscriptionProductConfig = {
      ...product,
      default: { ...product.default, railId: defaultRailId },
    };

    const nextStored: PlatformBillingStoredConfig = {
      ...storedConfig,
      defaultRailId,
      rails: nextRails,
      products: {
        ...(storedConfig.products ?? {}),
        [CAMPUS_SUBSCRIPTION_PRODUCT]: nextProduct,
      },
    };

    await this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        platformBillingConfig: nextStored as Prisma.InputJsonValue,
        platformBillingSecrets: nextEncrypted,
      },
      update: {
        platformBillingConfig: nextStored as Prisma.InputJsonValue,
        ...(nextEncrypted !== encryptedPayload
          ? { platformBillingSecrets: nextEncrypted }
          : {}),
      },
    });

    return this.getRails();
  }

  /** @deprecated Prefer setRails */
  async set(body: {
    rails?: Array<{
      id: string;
      enabled?: boolean;
      config?: Record<string, string>;
      secrets?: Record<string, string>;
    }>;
  }): Promise<PlatformBillingRailsDto & { defaultRegion: string }> {
    const rails = await this.setRails(body);
    return { ...rails, defaultRegion: 'UA' };
  }

  async getCampusSubscription(): Promise<CampusSubscriptionProductDto> {
    const { storedConfig } = await this.loadRow();
    const product = readCampusSubscriptionProduct(storedConfig);
    const railsDto = await this.getRails();
    const availableRails: CampusSubscriptionProductDto['availableRails'] = railsDto.rails
      .filter((r) => r.enabled && r.configured)
      .map((r) => ({
        id: r.id as string,
        title: r.title,
        pricingMode: pricingModeForRail(r.id),
      }));
    const allowedIds: string[] = availableRails.map((r) => r.id);
    const fallbackRailId: string =
      (allowedIds.includes(railsDto.defaultRailId) ? railsDto.defaultRailId : null) ||
      availableRails[0]?.id ||
      '';

    const withPreferredDefault: CampusSubscriptionProductConfig = {
      ...product,
      default: {
        ...product.default,
        railId: railsDto.defaultRailId || product.default.railId,
      },
    };
    const coerced = coerceCampusSubscriptionRails(
      withPreferredDefault,
      allowedIds,
      fallbackRailId,
    );

    return {
      ...coerced,
      availableRails,
    };
  }

  async setCampusSubscription(body: unknown): Promise<CampusSubscriptionProductDto> {
    let product: CampusSubscriptionProductConfig;
    try {
      product = parseCampusSubscriptionInput(body);
    } catch (e) {
      throw new BadRequestException(e instanceof Error ? e.message : 'Invalid campus subscription');
    }

    const railsDto = await this.getRails();
    const allowed = new Set<string>(
      railsDto.rails.filter((r) => r.enabled && r.configured).map((r) => r.id as string),
    );
    for (const railId of [
      product.default.railId,
      ...product.countryOverrides.map((o) => o.railId),
    ]) {
      if (!platformRailById(railId)) {
        throw new BadRequestException(`Unknown platform billing rail: ${railId}`);
      }
      if (!allowed.has(railId)) {
        throw new BadRequestException(
          `Rail "${railId}" is disabled or not configured — enable and configure it under Payment rails first`,
        );
      }
    }

    const { storedConfig, encryptedPayload } = await this.loadRow();
    const nextStored: PlatformBillingStoredConfig = {
      ...storedConfig,
      defaultRailId: product.default.railId,
      rails: storedConfig.rails,
      products: {
        ...(storedConfig.products ?? {}),
        [CAMPUS_SUBSCRIPTION_PRODUCT]: product,
      },
    };

    await this.prisma.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        platformBillingConfig: nextStored as Prisma.InputJsonValue,
        platformBillingSecrets: encryptedPayload,
      },
      update: {
        platformBillingConfig: nextStored as Prisma.InputJsonValue,
      },
    });

    return this.getCampusSubscription();
  }

  /** Live credential check for a platform rail (Stripe API; others: secrets present). */
  async testRail(railId: string): Promise<PlatformRailTestResult> {
    if (!platformRailById(railId)) {
      throw new BadRequestException(`Unknown platform billing rail: ${railId}`);
    }
    const dto = await this.getRails();
    const rail = dto.rails.find((r) => r.id === railId);
    if (!rail) throw new BadRequestException(`Unknown platform billing rail: ${railId}`);
    if (!rail.configured) {
      return { ok: false, message: 'Rail is not configured — save required secrets first' };
    }

    if (railId === 'stripe_platform') {
      const cfg = await this.resolvePlatformStripe();
      const stripe = getPlatformStripeClient(cfg.secretKey);
      if (!stripe) return { ok: false, message: 'Stripe secret key missing' };
      try {
        await stripe.balance.retrieve();
        return { ok: true, message: 'Stripe credentials OK (balance.retrieve succeeded)' };
      } catch (e) {
        return {
          ok: false,
          message: e instanceof Error ? e.message : 'Stripe API request failed',
        };
      }
    }

    if (railId === 'monopay_platform') {
      const { secrets } = await this.loadRow();
      const token = secrets.monopay_platform?.token?.trim();
      if (!token) return { ok: false, message: 'MonoPay token missing' };
      try {
        const res = await fetch('https://api.monobank.ua/personal/client-info', {
          headers: { 'X-Token': token },
        });
        if (res.ok) {
          return { ok: true, message: 'MonoPay token accepted by Monobank API' };
        }
        // Merchant tokens may not work on personal endpoint — treat 403 with body as "reachable"
        if (res.status === 403 || res.status === 401) {
          const text = await res.text().catch(() => '');
          if (text.toLowerCase().includes('token') || text.length > 0) {
            return {
              ok: true,
              message: 'MonoPay API reachable (token format accepted; use merchant dashboard to confirm)',
            };
          }
          return { ok: false, message: `MonoPay API rejected token (HTTP ${res.status})` };
        }
        return { ok: false, message: `MonoPay API returned HTTP ${res.status}` };
      } catch (e) {
        return {
          ok: false,
          message: e instanceof Error ? e.message : 'MonoPay network error',
        };
      }
    }

    // LiqPay / WayForPay: no cheap public ping — confirm secrets are stored.
    return {
      ok: true,
      message: 'Required secrets are saved. Live checkout test is not available for this rail yet.',
    };
  }

  /**
   * Resolve Layer-B offer for a campus from School.billingCountry (never IP).
   */
  async resolveCampusSubscriptionOffer(
    schoolId: string,
  ): Promise<ResolvedCampusSubscriptionOffer> {
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { billingCountry: true },
    });
    if (!school) throw new NotFoundException('School not found');
    const { storedConfig } = await this.loadRow();
    const product = readCampusSubscriptionProduct(storedConfig);
    return resolveOfferFromProduct(product, school.billingCountry);
  }

  /** Stripe credentials for Layer-B checkout/webhooks: DB → env. */
  async resolvePlatformStripe(): Promise<ResolvedPlatformStripeConfig> {
    const { storedConfig, secrets } = await this.loadRow();
    const row = storedConfig.rails?.stripe_platform;
    const enabled = row?.enabled ?? true;
    const product = readCampusSubscriptionProduct(storedConfig);
    const defaultPrices = product.default.prices;
    const cfg = this.cleanStringMap(row?.config);
    const sec = secrets.stripe_platform ?? {};
    return {
      enabled,
      secretKey: sec.secretKey || process.env['STRIPE_PLATFORM_SECRET_KEY']?.trim() || null,
      webhookSecret:
        sec.webhookSecret || process.env['STRIPE_PLATFORM_WEBHOOK_SECRET']?.trim() || null,
      priceStarter:
        defaultPrices.STARTER?.stripePriceId ||
        cfg.priceStarter ||
        process.env['STRIPE_PRICE_STARTER']?.trim() ||
        null,
      pricePro:
        defaultPrices.PRO?.stripePriceId ||
        cfg.pricePro ||
        process.env['STRIPE_PRICE_PRO']?.trim() ||
        null,
    };
  }

  private resolveDefaultRailId(
    storedConfig: PlatformBillingStoredConfig,
    rails: PlatformBillingRailDto[],
  ): string {
    const candidate =
      storedConfig.defaultRailId ||
      storedConfig.products?.campus_subscription?.default?.railId ||
      'stripe_platform';
    const enabled = rails.find((r) => r.id === candidate && r.enabled);
    if (enabled) return enabled.id;
    const firstEnabled = rails.find((r) => r.enabled);
    return firstEnabled?.id ?? 'stripe_platform';
  }

  private async loadRow(): Promise<{
    storedConfig: PlatformBillingStoredConfig;
    secrets: PlatformRailSecretsMap;
    encryptedPayload: string | null;
  }> {
    const row = await this.prisma.platformSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { platformBillingConfig: true, platformBillingSecrets: true },
    });
    const storedConfig = this.parseConfig(row?.platformBillingConfig);
    const encryptedPayload = row?.platformBillingSecrets ?? null;
    let secrets: PlatformRailSecretsMap = {};
    if (encryptedPayload) {
      const key = this.encryptionKey();
      if (!key) {
        throw new InternalServerErrorException(
          'PLATFORM_SECRETS_ENCRYPTION_KEY or PAYMENT_SECRETS_ENCRYPTION_KEY is required to read platform billing secrets',
        );
      }
      try {
        secrets = decryptPlatformBillingSecrets(encryptedPayload, key);
      } catch (error) {
        throw new InternalServerErrorException(
          `Failed to decrypt platform billing secrets: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
    return { storedConfig, secrets, encryptedPayload };
  }

  private parseConfig(raw: unknown): PlatformBillingStoredConfig {
    if (!raw || typeof raw !== 'object') return {};
    return raw as PlatformBillingStoredConfig;
  }

  private cleanStringMap(raw: unknown): Record<string, string> {
    if (!raw || typeof raw !== 'object') return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim();
    }
    return out;
  }

  private secretFieldStatus(
    railId: string,
    fieldKey: string,
    systemValue: string | undefined,
  ): PlatformBillingRailSecretStatus {
    if (systemValue) return { configured: true, source: 'system' };
    if (railId === 'stripe_platform') {
      if (fieldKey === 'secretKey' && process.env['STRIPE_PLATFORM_SECRET_KEY']?.trim()) {
        return { configured: true, source: 'env' };
      }
      if (fieldKey === 'webhookSecret' && process.env['STRIPE_PLATFORM_WEBHOOK_SECRET']?.trim()) {
        return { configured: true, source: 'env' };
      }
    }
    return { configured: false, source: 'missing' };
  }

  private encryptionKey(): string | null {
    return (
      process.env['PLATFORM_SECRETS_ENCRYPTION_KEY']?.trim() ||
      process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim() ||
      null
    );
  }
}

export { normalizeBillingCountryInput };
