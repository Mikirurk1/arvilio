import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { promises as dns } from 'dns';
import { randomBytes } from 'crypto';
import { PrismaService } from '@be/prisma';

export interface SchoolDomainDto {
  id: string;
  hostname: string;
  kind: 'SUBDOMAIN' | 'CUSTOM';
  verified: boolean;
  verifyToken: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface AddDomainDto {
  hostname: string;
}

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(schoolId: string): Promise<SchoolDomainDto[]> {
    const rows = await this.prisma.schoolDomain.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toDto);
  }

  async add(schoolId: string, body: AddDomainDto): Promise<SchoolDomainDto> {
    const hostname = normalizeHostname(body.hostname);
    const verifyToken = randomBytes(20).toString('hex');
    const row = await this.prisma.schoolDomain.create({
      data: {
        schoolId,
        hostname,
        kind: 'CUSTOM',
        verified: false,
        verifyToken,
        isPrimary: false,
      },
    });
    return toDto(row);
  }

  async verify(schoolId: string, id: string): Promise<SchoolDomainDto> {
    const row = await this.prisma.schoolDomain.findUnique({ where: { id } });
    if (!row || row.schoolId !== schoolId) throw new NotFoundException('Domain not found');
    if (row.verified) return toDto(row);
    if (!row.verifyToken) throw new ForbiddenException('No verification token; re-add the domain');

    const expected = `soe-verify=${row.verifyToken}`;
    const found = await checkTxtRecord(row.hostname, expected);
    if (!found) {
      throw new ForbiddenException(
        `TXT record not found. Add a DNS TXT record for ${row.hostname}: ${expected}`,
      );
    }

    const updated = await this.prisma.schoolDomain.update({
      where: { id },
      data: { verified: true },
    });
    return toDto(updated);
  }

  async remove(schoolId: string, id: string): Promise<void> {
    const row = await this.prisma.schoolDomain.findUnique({ where: { id } });
    if (!row || row.schoolId !== schoolId) throw new NotFoundException('Domain not found');
    await this.prisma.schoolDomain.delete({ where: { id } });
  }
}

/** Strip port, lowercase, trim. No HTTP fetch — hostname string only. */
function normalizeHostname(raw: string): string {
  const h = raw.trim().toLowerCase().replace(/^https?:\/\//i, '');
  const colon = h.indexOf(':');
  return colon !== -1 ? h.slice(0, colon) : h;
}

/**
 * SSRF-safe DNS TXT lookup — uses Node `dns` module only, never fetches a URL.
 * Returns true when the expected token string appears in any TXT record value.
 */
async function checkTxtRecord(hostname: string, expected: string): Promise<boolean> {
  try {
    const records = await dns.resolveTxt(hostname);
    return records.some((chunks) => chunks.join('').includes(expected));
  } catch {
    return false;
  }
}

function toDto(row: {
  id: string;
  hostname: string;
  kind: string;
  verified: boolean;
  verifyToken: string | null;
  isPrimary: boolean;
  createdAt: Date;
}): SchoolDomainDto {
  return {
    id: row.id,
    hostname: row.hostname,
    kind: row.kind as SchoolDomainDto['kind'],
    verified: row.verified,
    verifyToken: row.verifyToken,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt.toISOString(),
  };
}
