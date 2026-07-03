/**
 * Pure tenant-scoping logic for the Prisma `$extends` wrapper (Phase 1, ADR-005).
 *
 * Kept as a pure function so the *risky* part (what gets injected into every
 * query) is exhaustively unit-testable without a database. The extension in
 * `tenant-prisma.service.ts` only wires this into `$allModels.$allOperations`.
 *
 * `TENANT_SCOPED_MODELS` is the single source of truth for which models carry a
 * `schoolId`. It is intentionally registered **per model as the `schoolId`
 * column lands** (DB migration step) — until a model is listed here, scoping is
 * inert for it, so this can ship before the backfill migration without breaking
 * existing queries.
 */

/** Models that have a `schoolId` column and must be auto-scoped. */
export const TENANT_SCOPED_MODELS = new Set<string>([
  // Models that already carry schoolId (tenant anchor tables).
  'SchoolMembership',
  'SchoolDomain',
  'SchoolSubscription',
  'LibraryMaterial',
  'ScheduledLesson',
  'Quiz',
  'SpeakingTopic',
  'ChatConversation',
  'Payment',
  'StudentLessonBalance',
  'LessonBalanceLedger',
  'StaffCompensationProfile',
  'StudentGroup',
  'PracticeSession',
  'StudentWordCard',
  'StudentLearningLanguage',
  'StaffPayout',
  'NotificationDelivery',
  'TeacherMessage',
  'ScheduledLessonParticipant',
  'QuizAssignment',
  'QuizAttempt',
  'SpeakingSubmission',
  // Global catalogs stay OUT: Language, Word, WordDefinition.
]);

/** Operations whose `where` must be constrained to the tenant. */
const WHERE_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
  'updateMany',
  'deleteMany',
]);

/** Unique-selector operations — handled like WHERE but flagged (see caveat). */
const UNIQUE_OPS = new Set(['findUnique', 'findUniqueOrThrow', 'update', 'delete']);

/** Operations that write new rows and must stamp `schoolId` into `data`. */
const CREATE_OPS = new Set(['create', 'createMany']);

export function isTenantModel(model: string | undefined): boolean {
  return !!model && TENANT_SCOPED_MODELS.has(model);
}

export interface ScopeInput {
  model: string | undefined;
  operation: string;
  args: unknown;
  /** Active tenant id (null on public/platform paths). */
  schoolId: string | null;
  /** When true, scoping is bypassed (audited platform-admin path). */
  isPlatform: boolean;
}

type AnyArgs = Record<string, unknown>;

function stampData(data: unknown, schoolId: string): unknown {
  if (Array.isArray(data)) {
    return data.map((row) => ({ schoolId, ...(row as AnyArgs) }));
  }
  return { schoolId, ...(data as AnyArgs) };
}

/**
 * Return a new args object scoped to `schoolId`. Throws if a tenant model is
 * accessed without a tenant in context and not via the platform bypass — this
 * is the fail-loud guarantee that prevents accidental cross-tenant access.
 */
export function scopeArgs(input: ScopeInput): unknown {
  const { model, operation, args, schoolId, isPlatform } = input;

  if (isPlatform) return args;
  if (!isTenantModel(model)) return args;

  if (!schoolId) {
    throw new Error(
      `Tenant scope: refusing ${model}.${operation} without an active schoolId. ` +
        `Use asPlatform() for legitimate cross-tenant access.`,
    );
  }

  const a: AnyArgs = { ...((args as AnyArgs) ?? {}) };

  if (CREATE_OPS.has(operation)) {
    a.data = stampData(a.data, schoolId);
    return a;
  }

  if (operation === 'upsert') {
    a.where = { ...((a.where as AnyArgs) ?? {}), schoolId };
    a.create = { schoolId, ...((a.create as AnyArgs) ?? {}) };
    return a;
  }

  if (WHERE_OPS.has(operation) || UNIQUE_OPS.has(operation)) {
    a.where = { ...((a.where as AnyArgs) ?? {}), schoolId };
    return a;
  }

  return a;
}
