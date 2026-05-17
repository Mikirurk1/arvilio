/**
 * SUPER_ADMIN management CLI.
 *
 * SUPER_ADMIN accounts cannot be created or removed via the HTTP API. This
 * script is the only path. Every mutating command requires a short-lived JWT
 * signed with `SUPER_ADMIN_CLI_SECRET`, which is issued by the `token`
 * sub-command (so only operators with shell access to the server / env can
 * produce one).
 *
 * Commands:
 *   token  [--ttl 10m]                                  Issue a CLI JWT.
 *   create --token <jwt> --email <e> [--password <p>]   Create or promote to
 *          [--name <n>]                                  SUPER_ADMIN.
 *   revoke --token <jwt> --email <e> [--to student]     Demote SUPER_ADMIN
 *                                                        (default: STUDENT).
 *   delete --token <jwt> --email <e>                    Delete the SUPER_ADMIN
 *                                                        user entirely.
 *   list   --token <jwt>                                List SUPER_ADMIN users.
 *
 * Usage example:
 *   export SUPER_ADMIN_CLI_SECRET=$(openssl rand -hex 48)
 *   TOKEN=$(npm run --silent super-admin -- token)
 *   npm run super-admin -- create --token "$TOKEN" \
 *     --email admin@example.com --password "StrongPass!23" --name "Root"
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as jwt from 'jsonwebtoken';

type CliArgs = Record<string, string>;

const JWT_PURPOSE = 'super_admin_cli';

/**
 * Loads variables from a .env file at the repository root if present. Values
 * already present in process.env are not overwritten. This keeps the CLI
 * usable without `source .env` or extra dependencies.
 */
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
  if (!match) throw new Error(`Invalid --ttl value "${input}". Use seconds (e.g. 600) or 10m / 2h / 1d.`);
  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[unit];
}

async function issueToken(args: CliArgs): Promise<void> {
  const ttlSeconds = parseTtlSeconds(args.ttl, 600);
  const token = jwt.sign({ purpose: JWT_PURPOSE }, getCliSecret(), { expiresIn: ttlSeconds });
  process.stdout.write(`${token}\n`);
}

async function createSuperAdmin(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  const email = requireArg(args, 'email').toLowerCase();
  const name = args.name;
  const password = args.password;

  await withPrisma(async (prisma) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          displayName: name ?? existing.displayName,
          ...(passwordHash ? { passwordHash } : {}),
        },
        select: { id: true, email: true, role: true },
      });
      console.log(
        `Promoted ${updated.email} (id=${updated.id}) to ${updated.role}.`,
      );
      return;
    }

    if (!password) {
      throw new Error(
        `User ${email} does not exist. Provide --password to create a fresh SUPER_ADMIN.`,
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: name ?? email.split('@')[0],
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
      select: { id: true, email: true, role: true },
    });
    console.log(`Created ${created.role} ${created.email} (id=${created.id}).`);
  });
}

async function revokeSuperAdmin(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  const email = requireArg(args, 'email').toLowerCase();
  const to = (args.to ?? 'student').toUpperCase();
  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(to)) {
    throw new Error(`Invalid --to value "${args.to}". Allowed: student, teacher, admin.`);
  }

  await withPrisma(async (prisma) => {
    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) throw new Error(`No user with email ${email}`);
    if (target.role !== 'SUPER_ADMIN') {
      throw new Error(`User ${email} is not SUPER_ADMIN (current role: ${target.role}).`);
    }
    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { role: to as 'STUDENT' | 'TEACHER' | 'ADMIN' },
      select: { email: true, role: true },
    });
    console.log(`Revoked SUPER_ADMIN on ${updated.email} → ${updated.role}.`);
  });
}

async function deleteSuperAdmin(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  const email = requireArg(args, 'email').toLowerCase();
  await withPrisma(async (prisma) => {
    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) throw new Error(`No user with email ${email}`);
    if (target.role !== 'SUPER_ADMIN') {
      throw new Error(
        `Refusing to delete: ${email} is not SUPER_ADMIN (role=${target.role}). Use API or DB admin tools.`,
      );
    }
    await prisma.user.delete({ where: { id: target.id } });
    console.log(`Deleted SUPER_ADMIN ${email} (id=${target.id}).`);
  });
}

async function listSuperAdmins(args: CliArgs): Promise<void> {
  verifyCliToken(requireArg(args, 'token'));
  await withPrisma(async (prisma) => {
    const admins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });
    if (admins.length === 0) {
      console.log('No SUPER_ADMIN accounts.');
      return;
    }
    for (const admin of admins) {
      console.log(
        `${admin.email}\t${admin.displayName}\t${admin.id}\t${admin.createdAt.toISOString()}`,
      );
    }
  });
}

function printHelp(): void {
  console.log(
    [
      'Usage: npm run super-admin -- <command> [options]',
      '',
      'Commands:',
      '  token  [--ttl 10m]                                Issue a CLI JWT (uses SUPER_ADMIN_CLI_SECRET).',
      '  create --token <jwt> --email <e> [--password <p>] [--name <n>]',
      '         Create or promote a user to SUPER_ADMIN.',
      '  revoke --token <jwt> --email <e> [--to student|teacher|admin]',
      '         Demote SUPER_ADMIN (default --to student).',
      '  delete --token <jwt> --email <e>                  Delete a SUPER_ADMIN user.',
      '  list   --token <jwt>                              List all SUPER_ADMIN users.',
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
    case 'create':
      await createSuperAdmin(args);
      return;
    case 'revoke':
      await revokeSuperAdmin(args);
      return;
    case 'delete':
      await deleteSuperAdmin(args);
      return;
    case 'list':
      await listSuperAdmins(args);
      return;
    default:
      printHelp();
      throw new Error(`Unknown command: ${rawCommand}`);
  }
}

main().catch((error) => {
  const err = error as Error & { code?: string; cause?: unknown };
  const details = err.message?.trim() || err.stack || String(error);
  console.error('[super-admin]', details);
  if (err.code) console.error(`[super-admin] code=${err.code}`);
  if (err.cause) console.error('[super-admin] cause=', err.cause);
  process.exit(1);
});
