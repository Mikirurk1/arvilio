import { Injectable } from '@nestjs/common';
import { EntitlementsService } from '@be/billing/entitlements';
import { TenantContextService } from '@be/tenant';
import { AuthService, type UserRoleName } from './auth.service';

const MAX_ROWS = 500;

export interface ImportRow {
  line: number;
  email: string;
  displayName: string;
}

export interface ImportRowError {
  line: number;
  email: string;
  error: string;
}

export interface ImportPreviewDto {
  valid: ImportRow[];
  invalid: ImportRowError[];
  seatCapRemaining: number | null;
  wouldExceedCap: boolean;
}

export interface ImportConfirmDto {
  created: number;
  skipped: number;
  failed: Array<{ email: string; error: string }>;
}

@Injectable()
export class ImportStudentsService {
  constructor(
    private readonly auth: AuthService,
    private readonly tenant: TenantContextService,
    private readonly entitlements: EntitlementsService,
  ) {}

  /**
   * Parse CSV and return a dry-run preview. No users are created.
   * CSV format: email,fullName (header row optional).
   */
  async preview(csvText: string): Promise<ImportPreviewDto> {
    const { valid, invalid } = parseCsv(csvText);
    const schoolId = this.tenant.requireSchoolId();
    const summary = await this.entitlements.getSummary(schoolId);
    const seatCapRemaining = summary.seatsRemaining;
    const wouldExceedCap =
      seatCapRemaining !== null && valid.length > seatCapRemaining;
    return { valid, invalid, seatCapRemaining, wouldExceedCap };
  }

  /**
   * Create users for each valid row. Rows that already exist or hit the seat cap
   * are counted as skipped (not errors). Returns a summary.
   */
  async confirm(
    actor: { id: string; role: UserRoleName },
    valid: ImportRow[],
  ): Promise<ImportConfirmDto> {
    let created = 0;
    let skipped = 0;
    const failed: Array<{ email: string; error: string }> = [];

    for (const row of valid) {
      try {
        await this.auth.createUserAsAdmin(actor, {
          email: row.email,
          displayName: row.displayName || undefined,
          role: 'student',
        });
        created++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('already registered') ||
          msg.includes('seat limit')
        ) {
          skipped++;
        } else {
          failed.push({ email: row.email, error: msg });
        }
      }
    }

    return { created, skipped, failed };
  }
}

// ---------------------------------------------------------------------------
// CSV parser — no external deps
// ---------------------------------------------------------------------------

function parseCsv(text: string): { valid: ImportRow[]; invalid: ImportRowError[] } {
  const valid: ImportRow[] = [];
  const invalid: ImportRowError[] = [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { valid, invalid };

  // Skip header row if first non-empty line looks like a header
  const firstLow = lines[0].toLowerCase();
  const startIdx = firstLow.startsWith('email') || firstLow.startsWith('"email') ? 1 : 0;

  const data = lines.slice(startIdx, startIdx + MAX_ROWS);

  for (let i = 0; i < data.length; i++) {
    const line = startIdx + i + 1;
    const cols = splitCsvRow(data[i]);
    const email = (cols[0] ?? '').replace(/^"|"$/g, '').trim().toLowerCase();
    const displayName = (cols[1] ?? '').replace(/^"|"$/g, '').trim();

    if (!email) {
      invalid.push({ line, email: '', error: 'Empty email' });
      continue;
    }
    if (!email.includes('@') || email.length > 254) {
      invalid.push({ line, email, error: 'Invalid email format' });
      continue;
    }

    valid.push({ line, email, displayName });
  }

  return { valid, invalid };
}

function splitCsvRow(row: string): string[] {
  const cols: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuote && row[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      cols.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}
