import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EntitlementsService } from '@be/billing/entitlements';
import { PrismaService } from '@be/prisma';
import { TenantContextService } from '@be/tenant';
import {
  getPlatformGlobalIntegrationRuntime,
  mergePlatformIntegrationConfig,
  parsePlatformIntegrationConfig,
  readStoredSecretsFromRow,
  refreshPlatformIntegrationRuntime,
  resolvePlatformIntegration,
} from '@be/platform-integration';
import {
  encryptIntegrationSecrets,
  hasIntegrationSecretUpdates,
  mergeIntegrationSecrets,
} from '@be/platform-integration';
import type {
  PlatformLlmSettingsDto,
  SchoolLlmSettingsDto,
  TestLlmConnectionRequestDto,
  TestLlmConnectionResultDto,
  UpdatePlatformIntegrationSettingsRequestDto,
  UpdateSchoolLlmSettingsRequestDto,
} from '@pkg/types';
import {
  applySchoolLlmUpdate,
  buildSchoolLlmSettingsDto,
  mergeLlmRuntime,
  parseSchoolLlmOverride,
  platformLlmFromIntegrationRow,
  type MergedLlm,
} from './llm-settings.util';
import { testLlmConnection } from './llm-connection-test';

const PLATFORM_SETTINGS_ID = 'default';

@Injectable()
export class LlmSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
    private readonly tenant: TenantContextService,
  ) {}

  private masterKey(): string | null {
    return (
      process.env['PLATFORM_SECRETS_ENCRYPTION_KEY']?.trim() ||
      process.env['PAYMENT_SECRETS_ENCRYPTION_KEY']?.trim() ||
      null
    );
  }

  async getPlatformLlmSettings(): Promise<PlatformLlmSettingsDto> {
    const row = await this.ensurePlatformSettings();
    return platformLlmFromIntegrationRow(
      row.integrationConfig,
      row.integrationSecrets,
    ).settings;
  }

  async updatePlatformLlmSettings(
    body: UpdatePlatformIntegrationSettingsRequestDto,
  ): Promise<PlatformLlmSettingsDto> {
    const row = await this.ensurePlatformSettings();
    const currentSecrets = readStoredSecretsFromRow(
      row.integrationSecrets,
      this.masterKey(),
    );
    const currentConfig = parsePlatformIntegrationConfig(row.integrationConfig);
    const nextConfig = mergePlatformIntegrationConfig(currentConfig, {
      llm: body.config?.llm,
    });
    const nextSecrets = hasIntegrationSecretUpdates(body.secrets)
      ? mergeIntegrationSecrets(currentSecrets, {
          llmApiKey: body.secrets?.llmApiKey,
          anthropicApiKey: body.secrets?.anthropicApiKey,
        })
      : currentSecrets;

    let secretsPayload = row.integrationSecrets;
    if (hasIntegrationSecretUpdates(body.secrets)) {
      const key = this.masterKey();
      if (!key) {
        throw new BadRequestException(
          'Set PLATFORM_SECRETS_ENCRYPTION_KEY (or PAYMENT_SECRETS_ENCRYPTION_KEY) to store API keys',
        );
      }
      secretsPayload = encryptIntegrationSecrets(nextSecrets, key);
    }

    await this.prisma.platformSettings.update({
      where: { id: PLATFORM_SETTINGS_ID },
      data: {
        integrationConfig: nextConfig as unknown as Prisma.InputJsonValue,
        integrationSecrets: secretsPayload,
      },
    });

    refreshPlatformIntegrationRuntime(nextConfig, nextSecrets);
    return this.getPlatformLlmSettings();
  }

  async getSchoolLlmSettings(schoolId: string): Promise<SchoolLlmSettingsDto> {
    const platformRow = await this.ensurePlatformSettings();
    const platform = platformLlmFromIntegrationRow(
      platformRow.integrationConfig,
      platformRow.integrationSecrets,
    );
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        integrationConfig: true,
        integrationSecrets: true,
      },
    });
    if (!school) throw new BadRequestException('School not found');

    const canOverride = await this.entitlements.hasFeature(schoolId, 'aiAssist');
    return buildSchoolLlmSettingsDto({
      platformResolved: platform.resolved,
      platformStoredSecrets: platform.storedSecrets,
      platformConfig: platform.config,
      schoolRawConfig: school.integrationConfig,
      schoolSecretsPayload: school.integrationSecrets,
      canOverride,
    });
  }

  async updateSchoolLlmSettings(
    schoolId: string,
    body: UpdateSchoolLlmSettingsRequestDto,
  ): Promise<SchoolLlmSettingsDto> {
    const canOverride = await this.entitlements.hasFeature(schoolId, 'aiAssist');
    if (!canOverride) {
      throw new ForbiddenException({
        message: 'Custom LLM requires the Pro plan (aiAssist).',
        featureBlocked: 'aiAssist',
      });
    }

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { integrationConfig: true, integrationSecrets: true },
    });
    if (!school) throw new BadRequestException('School not found');

    let next: ReturnType<typeof applySchoolLlmUpdate>;
    try {
      next = applySchoolLlmUpdate(
        school.integrationConfig,
        school.integrationSecrets,
        body,
      );
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to update LLM settings',
      );
    }

    await this.prisma.school.update({
      where: { id: schoolId },
      data: {
        integrationConfig: next.nextConfigJson as Prisma.InputJsonValue,
        integrationSecrets: next.nextSecretsPayload,
      },
    });

    await this.refreshSchoolRuntime(schoolId);
    return this.getSchoolLlmSettings(schoolId);
  }

  /**
   * Effective LLM for chat: school override → platform defaults → env.
   */
  async resolveEffectiveLlm(schoolId?: string | null): Promise<MergedLlm> {
    const platform = getPlatformGlobalIntegrationRuntime().llm;
    if (!schoolId) {
      return mergeLlmRuntime(platform, null);
    }

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { integrationConfig: true, integrationSecrets: true },
    });
    if (!school) return mergeLlmRuntime(platform, null);

    const parsed = parseSchoolLlmOverride(school.integrationConfig);
    parsed.secrets = readStoredSecretsFromRow(
      school.integrationSecrets,
      this.masterKey(),
    );
    return mergeLlmRuntime(platform, parsed);
  }

  async refreshSchoolRuntime(schoolId: string): Promise<void> {
    const platformRow = await this.ensurePlatformSettings();
    const platformSecrets = readStoredSecretsFromRow(
      platformRow.integrationSecrets,
      this.masterKey(),
    );
    const platformConfig = parsePlatformIntegrationConfig(
      platformRow.integrationConfig,
    );
    const platformResolved = resolvePlatformIntegration(
      platformConfig,
      platformSecrets,
    );

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { integrationConfig: true, integrationSecrets: true },
    });
    const parsed = parseSchoolLlmOverride(school?.integrationConfig);
    parsed.secrets = readStoredSecretsFromRow(
      school?.integrationSecrets ?? null,
      this.masterKey(),
    );
    const mergedLlm = mergeLlmRuntime(platformResolved.llm, parsed);

    // Cache a full integration blob with LLM overridden for this school.
    refreshPlatformIntegrationRuntime(
      {
        ...platformConfig,
        llm: {
          enabled: mergedLlm.enabled,
          provider: mergedLlm.provider,
          baseUrl: mergedLlm.baseUrl,
          model: mergedLlm.model,
          maxTokens: mergedLlm.maxTokens,
          temperature: mergedLlm.temperature,
        },
      },
      {
        ...platformSecrets,
        ...(parsed.overrideEnabled
          ? {
              llmApiKey: parsed.secrets.llmApiKey ?? platformSecrets.llmApiKey,
              anthropicApiKey:
                parsed.secrets.anthropicApiKey ?? platformSecrets.anthropicApiKey,
            }
          : {}),
      },
      schoolId,
    );
  }

  requireSchoolId(): string {
    const id = this.tenant.schoolId;
    if (!id) throw new BadRequestException('School context required');
    return id;
  }

  /**
   * Probe school effective LLM (platform default or override draft). Does not save.
   */
  async testSchoolLlm(
    schoolId: string,
    body?: TestLlmConnectionRequestDto,
  ): Promise<TestLlmConnectionResultDto> {
    const platformRow = await this.ensurePlatformSettings();
    const platformSecrets = readStoredSecretsFromRow(
      platformRow.integrationSecrets,
      this.masterKey(),
    );
    const platformConfig = parsePlatformIntegrationConfig(
      platformRow.integrationConfig,
    );
    const platformResolved = resolvePlatformIntegration(
      platformConfig,
      platformSecrets,
    );

    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
      select: { integrationConfig: true, integrationSecrets: true },
    });
    const parsed = parseSchoolLlmOverride(school?.integrationConfig);
    parsed.secrets = readStoredSecretsFromRow(
      school?.integrationSecrets ?? null,
      this.masterKey(),
    );

    if (body?.overrideEnabled !== undefined) {
      parsed.overrideEnabled = body.overrideEnabled === true;
    }
    if (body?.config) {
      parsed.config = { ...parsed.config, ...body.config };
    }
    if (body?.secrets) {
      if (body.secrets.llmApiKey?.trim()) {
        parsed.secrets.llmApiKey = body.secrets.llmApiKey.trim();
      }
      if (body.secrets.anthropicApiKey?.trim()) {
        parsed.secrets.anthropicApiKey = body.secrets.anthropicApiKey.trim();
      }
    }

    const merged = mergeLlmRuntime(platformResolved.llm, parsed);
    return testLlmConnection({
      provider: merged.provider,
      baseUrl: merged.baseUrl,
      model: merged.model ?? '',
      apiKey: merged.apiKey ?? '',
    });
  }

  private async ensurePlatformSettings() {
    return this.prisma.platformSettings.upsert({
      where: { id: PLATFORM_SETTINGS_ID },
      create: { id: PLATFORM_SETTINGS_ID },
      update: {},
    });
  }
}
