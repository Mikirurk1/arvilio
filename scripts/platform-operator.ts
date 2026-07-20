/**
 * Platform operator break-glass CLI (Control Plane Stage 1).
 *
 * No self-serve registration or password reset on apps/platform.
 * Operators are created / password-reset only via this CLI + SUPER_ADMIN_CLI_SECRET.
 *
 * Commands:
 *   token   [--ttl 10m]
 *   upsert  --token <jwt> --email <e> --password <p> [--role PLATFORM_ADMIN] [--name <n>]
 *   revoke  --token <jwt> --email <e>
 *   list    --token <jwt>
 *
 * Example:
 *   TOKEN=$(npm run --silent platform-operator -- token)
 *   npm run platform-operator -- upsert --token "$TOKEN" \
 *     --email ops@example.com --password 'StrongPass!23' --role PLATFORM_ADMIN
 */

import { PrismaClient, type PlatformRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as jwt from 'jsonwebtoken';

type CliArgs = Record<string, string>;

const JWT_PURPOSE = 'platform_operator_cli';
const ROLES: PlatformRole[] = ['PLATFORM_ADMIN', 'PLATFORM_SUPPORT', 'PLATFORM_BILLING'];

function loadDotenv(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDotenv();

function getCliSecret(): string {
  const secret = process.env.SUPER_ADMIN_CLI_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SUPER_ADMIN_CLI_SECRET must be set to a long random string (>=32 chars) in the environment.',
    );
  }
  return secret;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      if (next !== undefined && !next.startsWith('--')) {
        out[key] = next;
        i += 1;
      } else {
        out[key] = 'true';
      }
    }
  }
  return out;
}

function requireArg(args: CliArgs, name: string): string {
  const value = args[name];
  if (!value || value === 'true') {
    throw new Error(`Missing required --${name} argument`);
  }
  return value;
}

function verifyCliToken(token: string): void {
  try {
    const payload = jwt.verify(token, getCliSecret()) as { purpose?: string };
    if (payload.purpose !== JWT_PURPOSE) {
      throw new Error('Token purpose mismatch');
    }
  } catch (error) {
    throw new Error(`Invalid CLI token: ${(error as Error).message}`);
  }
}

function buildPrisma(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://soenglish:soenglish@localhost:5432/soenglish?schema=public';
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function withPrisma<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = buildPrisma();
  try {
    return await fn(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

function parseTtlSeconds(input: string | undefined, fallbackSeconds: number): number {
  if (!input) return fallbackSeconds;
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return Number.parseInt(trimmed, 10);
  const match = trimmed.match(/^(\d+)\s*(s|m|h|d)$/i);
  if (!match) throw new Error(`Invalid --ttl value "${input}". Use seconds or 10m / 2h / 1d.`);
  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

function parseRole(raw: string | undefined): PlatformRole {
  const role = (raw ?? 'PLATFORM_ADMIN').toUpperCase() as PlatformRole;
  if (!ROLES.includes(role)) {
    throw new Error(`Invalid --role. Use one of: ${ROLES.join(', ')}`);
  }
  return role;
}

async function issueToken(args: CliArgs): Promise<void> {
  const ttlSeconds = parseTtlSeconds(args.ttl, 600);
  const token = jwt.sign({ purpose: JWT_PURPOSE }, getCliSecret(), { expiresIn: ttlSeconds });
  process.stdout.write(`${token}\n`);
}

async function upsertOperator(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  const email = requireArg(args, 'email').toLowerCase();
  const password = requireArg(args, 'password');
  const role = parseRole(args.role);
  const name = args.name?.trim() || email.split('@')[0] || 'Operator';
  const passwordHash = await bcrypt.hash(password, 12);

  await withPrisma(async (prisma) => {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        displayName: name,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      update: {
        passwordHash,
        status: 'ACTIVE',
        displayName: args.name ? name : undefined,
      },
      select: { id: true, email: true },
    });

    const operator = await prisma.platformOperator.upsert({
      where: { userId: user.id },
      create: { userId: user.id, role },
      update: { role },
      select: { role: true },
    });

    await prisma.platformAuditLog.create({
      data: {
        actorUserId: user.id,
        action: 'platform.operator.cli_upsert',
        metadata: { email: user.email, role: operator.role, via: 'platform-operator-cli' },
        ip: null,
      },
    });

    console.error(
      `[platform-operator] Upserted ${user.email} (id=${user.id}) as ${operator.role}. Password set.`,
    );
  });
}

async function revokeOperator(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  const email = requireArg(args, 'email').toLowerCase();

  await withPrisma(async (prisma) => {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
    if (!user) throw new Error(`No user for ${email}`);
    const existing = await prisma.platformOperator.findUnique({ where: { userId: user.id } });
    if (!existing) {
      console.error(`[platform-operator] ${email} is not a platform operator.`);
      return;
    }
    await prisma.platformOperator.delete({ where: { userId: user.id } });
    await prisma.platformAuditLog.create({
      data: {
        actorUserId: user.id,
        action: 'platform.operator.cli_revoke',
        metadata: { email: user.email, via: 'platform-operator-cli' },
      },
    });
    console.error(`[platform-operator] Revoked PlatformOperator for ${email}. User row kept.`);
  });
}

async function listOperators(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  await withPrisma(async (prisma) => {
    const rows = await prisma.platformOperator.findMany({
      include: { user: { select: { email: true, displayName: true, status: true } } },
      orderBy: { createdAt: 'asc' },
    });
    for (const row of rows) {
      console.log(`${row.user.email}\t${row.role}\t${row.user.status}\t${row.user.displayName}`);
    }
    console.error(`[platform-operator] ${rows.length} operator(s).`);
  });
}

function printHelp(): void {
  console.log(
    [
      'Usage: npm run platform-operator -- <command> [options]',
      '',
      'Break-glass Control Plane operator management (no UI recovery).',
      '',
      'Commands:',
      '  token  [--ttl 10m]',
      '  upsert --token <jwt> --email <e> --password <p> [--role PLATFORM_ADMIN] [--name <n>]',
      '  revoke --token <jwt> --email <e>',
      '  list   --token <jwt>',
    ].join('\n'),
  );
}

async function main(): Promise<void> {
  const [rawCommand, ...rest] = process.argv.slice(2);
  const command = rawCommand?.toLowerCase();
  const args = parseArgs(rest);

  switch (command) {
    case undefined:
    case 'help':
    case '--help':
      printHelp();
      return;
    case 'token':
      await issueToken(args);
      return;
    case 'upsert':
      await upsertOperator(args);
      return;
    case 'revoke':
      await revokeOperator(args);
      return;
    case 'list':
      await listOperators(args);
      return;
    default:
      printHelp();
      throw new Error(`Unknown command: ${rawCommand}`);
  }
}

main().catch((error) => {
  console.error('[platform-operator]', (error as Error).message || error);
  process.exit(1);
});
