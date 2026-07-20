/**
 * Migrate 8× campus_strings_* buckets + campus_pages → campus-content + campus-global.
 * Also backfills missing uk locales on campus-tours from CAMPUS_TOUR_SEED.
 *
 * Run: npm run migrate:campus-content -w @app/cms
 */
import {
  CAMPUS_TOUR_SEED,
  CAMPUS_UI_PAGES,
  campusContentPlacementFromKey,
} from '@pkg/types';
import { randomBytes } from 'crypto';

const BUCKET_TABLES = [
  'campus_strings_chrome',
  'campus_strings_auth',
  'campus_strings_dashboard',
  'campus_strings_learning',
  'campus_strings_people',
  'campus_strings_money',
  'campus_strings_comms',
  'campus_strings_system',
] as const;

function newRowId(): string {
  return randomBytes(12).toString('hex');
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

async function main() {
  const { loadRootEnv } = await import('../../../scripts/load-root-env.mjs');
  loadRootEnv();

  const { default: pg } = await import('pg');
  const raw = process.env.PAYLOAD_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL required');
  const schema = process.env.PAYLOAD_WWW_SCHEMA ?? 'payload_www';
  const client = new pg.Client({ connectionString: raw.replace(/\?.*$/, '') });
  await client.connect();

  try {
    await client.query(`SET search_path TO ${schema}, public`);
    await ensureTables(client, schema);

    type LocMap = Partial<Record<'uk' | 'en', string>>;
    const byKey = new Map<string, { description: string | null; locales: LocMap }>();

    for (const table of BUCKET_TABLES) {
      const exists = await client.query(`SELECT to_regclass($1) AS t`, [`${schema}.${table}`]);
      if (!exists.rows[0]?.t) {
        console.log(`  skip missing ${table}`);
        continue;
      }
      const rows = await client.query<{
        key: string;
        description: string | null;
        locale: string;
        value: string;
      }>(`
        SELECT p.key, p.description, l._locale::text AS locale, l.value
        FROM ${quoteIdent(table)} p
        JOIN ${quoteIdent(`${table}_locales`)} l ON l._parent_id = p.id
      `);
      for (const row of rows.rows) {
        const cur = byKey.get(row.key) ?? { description: row.description, locales: {} };
        if (row.description && !cur.description) cur.description = row.description;
        if (row.locale === 'uk' || row.locale === 'en') {
          cur.locales[row.locale] = row.value;
        }
        byKey.set(row.key, cur);
      }
      console.log(`  read ${rows.rows.length} locale rows from ${table}`);
    }

    const globalStrings: Array<{
      key: string;
      description: string | null;
      locales: LocMap;
    }> = [];
    const contentStrings = new Map<
      string,
      Array<{ key: string; description: string | null; locales: LocMap }>
    >();

    for (const [key, data] of byKey) {
      const place = campusContentPlacementFromKey(key);
      if (place.kind === 'global') {
        globalStrings.push({ key, description: data.description, locales: data.locales });
      } else {
        const list = contentStrings.get(place.slug) ?? [];
        list.push({ key, description: data.description, locales: data.locales });
        contentStrings.set(place.slug, list);
      }
    }

    // Page chrome from campus_pages
    type PageChrome = {
      title?: LocMap;
      subtitle?: LocMap;
      body?: Partial<Record<'uk' | 'en', unknown>>;
    };
    const pageChrome = new Map<string, PageChrome>();
    const pagesExist = await client.query(`SELECT to_regclass($1) AS t`, [`${schema}.campus_pages`]);
    if (pagesExist.rows[0]?.t) {
      const pages = await client.query<{
        slug: string;
        locale: string;
        title: string | null;
        subtitle: string | null;
        body: unknown;
      }>(`
        SELECT p.slug, l._locale::text AS locale, l.title, l.subtitle, l.body
        FROM campus_pages p
        JOIN campus_pages_locales l ON l._parent_id = p.id
      `);
      for (const row of pages.rows) {
        const cur = pageChrome.get(row.slug) ?? {};
        const loc = row.locale === 'uk' || row.locale === 'en' ? row.locale : null;
        if (!loc) continue;
        cur.title = { ...(cur.title ?? {}), [loc]: row.title ?? undefined };
        cur.subtitle = { ...(cur.subtitle ?? {}), [loc]: row.subtitle ?? undefined };
        cur.body = { ...(cur.body ?? {}), [loc]: row.body ?? undefined };
        pageChrome.set(row.slug, cur);
        if (!contentStrings.has(row.slug)) contentStrings.set(row.slug, []);
      }
      console.log(`  read ${pages.rows.length} page locale rows`);
    }

    // Also ensure CAMPUS_UI_PAGES slugs exist as content docs
    for (const page of CAMPUS_UI_PAGES) {
      if (!contentStrings.has(page.slug)) contentStrings.set(page.slug, []);
      const chrome = pageChrome.get(page.slug) ?? {};
      chrome.title = {
        uk: page.locales.uk.title,
        en: page.locales.en.title,
        ...chrome.title,
      };
      chrome.subtitle = {
        uk: page.locales.uk.subtitle,
        en: page.locales.en.subtitle,
        ...chrome.subtitle,
      };
      pageChrome.set(page.slug, chrome);
    }

    await client.query('BEGIN');

    // Wipe targets for idempotent re-run
    await client.query(`DELETE FROM campus_global_strings_locales`);
    await client.query(`DELETE FROM campus_global_strings`);
    await client.query(`DELETE FROM campus_content_strings_locales`);
    await client.query(`DELETE FROM campus_content_strings`);
    await client.query(`DELETE FROM campus_content_locales`);
    await client.query(`DELETE FROM campus_content`);

    // Ensure global row
    let globalId: number;
    const g = await client.query<{ id: number }>(`SELECT id FROM campus_global LIMIT 1`);
    if (g.rows[0]) {
      globalId = g.rows[0].id;
      await client.query(`UPDATE campus_global SET updated_at = now() WHERE id = $1`, [globalId]);
    } else {
      const created = await client.query<{ id: number }>(
        `INSERT INTO campus_global (updated_at, created_at) VALUES (now(), now()) RETURNING id`,
      );
      globalId = created.rows[0]!.id;
    }

    let order = 0;
    for (const item of globalStrings.sort((a, b) => a.key.localeCompare(b.key))) {
      const rowId = newRowId();
      await client.query(
        `INSERT INTO campus_global_strings (_order, _parent_id, id, key, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [order++, globalId, rowId, item.key, item.description],
      );
      for (const loc of ['uk', 'en'] as const) {
        const value = item.locales[loc] ?? item.locales.en ?? item.locales.uk;
        if (!value) continue;
        await client.query(
          `INSERT INTO campus_global_strings_locales (value, _locale, _parent_id)
           VALUES ($1, $2::${quoteIdent(schema)}._locales, $3)`,
          [value, loc, rowId],
        );
      }
    }
    console.log(`  wrote ${globalStrings.length} global strings`);

    for (const [slug, strings] of [...contentStrings.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      const created = await client.query<{ id: number }>(
        `INSERT INTO campus_content (slug, updated_at, created_at)
         VALUES ($1, now(), now()) RETURNING id`,
        [slug],
      );
      const contentId = created.rows[0]!.id;
      const chrome = pageChrome.get(slug);

      for (const loc of ['uk', 'en'] as const) {
        const title = chrome?.title?.[loc] ?? chrome?.title?.en ?? slug;
        const subtitle = chrome?.subtitle?.[loc] ?? chrome?.subtitle?.en ?? null;
        const body = chrome?.body?.[loc] ?? chrome?.body?.en ?? null;
        await client.query(
          `INSERT INTO campus_content_locales (title, subtitle, body, _locale, _parent_id)
           VALUES ($1, $2, $3::jsonb, $4::${quoteIdent(schema)}._locales, $5)`,
          [
            title,
            subtitle,
            body == null ? null : typeof body === 'string' ? body : JSON.stringify(body),
            loc,
            contentId,
          ],
        );
      }

      let sOrder = 0;
      for (const item of strings.sort((a, b) => a.key.localeCompare(b.key))) {
        const rowId = newRowId();
        await client.query(
          `INSERT INTO campus_content_strings (_order, _parent_id, id, key, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [sOrder++, contentId, rowId, item.key, item.description],
        );
        for (const loc of ['uk', 'en'] as const) {
          const value = item.locales[loc] ?? item.locales.en ?? item.locales.uk;
          if (!value) continue;
          await client.query(
            `INSERT INTO campus_content_strings_locales (value, _locale, _parent_id)
             VALUES ($1, $2::${quoteIdent(schema)}._locales, $3)`,
            [value, loc, rowId],
          );
        }
      }
      console.log(`  content/${slug}: ${strings.length} strings`);
    }

    // Tours uk backfill
    await backfillTourUk(client, schema);

    await client.query('COMMIT');

    // Drop legacy
    for (const table of BUCKET_TABLES) {
      await client.query(`DROP TABLE IF EXISTS ${quoteIdent(`${table}_locales`)} CASCADE`);
      await client.query(`DROP TABLE IF EXISTS ${quoteIdent(table)} CASCADE`);
    }
    await client.query(`DROP TABLE IF EXISTS campus_pages_locales CASCADE`);
    await client.query(`DROP TABLE IF EXISTS campus_pages CASCADE`);
    console.log('Dropped legacy bucket + campus_pages tables');
    console.log('Done.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    await client.end();
  }
}

async function ensureTables(client: import('pg').Client, schema: string) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_global (
      id serial PRIMARY KEY,
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_global_strings (
      _order integer NOT NULL,
      _parent_id integer NOT NULL REFERENCES campus_global(id) ON DELETE CASCADE,
      id varchar PRIMARY KEY,
      key varchar NOT NULL,
      description varchar
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_global_strings_locales (
      value varchar NOT NULL,
      id serial PRIMARY KEY,
      _locale ${quoteIdent(schema)}._locales NOT NULL,
      _parent_id varchar NOT NULL REFERENCES campus_global_strings(id) ON DELETE CASCADE
    )
  `);
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE campus_global_strings_locales
        ADD CONSTRAINT campus_global_strings_locales_locale_parent_unique UNIQUE (_parent_id, _locale);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_content (
      id serial PRIMARY KEY,
      slug varchar NOT NULL UNIQUE,
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_content_locales (
      title varchar,
      subtitle varchar,
      body jsonb,
      id serial PRIMARY KEY,
      _locale ${quoteIdent(schema)}._locales NOT NULL,
      _parent_id integer NOT NULL REFERENCES campus_content(id) ON DELETE CASCADE
    )
  `);
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE campus_content_locales
        ADD CONSTRAINT campus_content_locales_locale_parent_unique UNIQUE (_parent_id, _locale);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_content_strings (
      _order integer NOT NULL,
      _parent_id integer NOT NULL REFERENCES campus_content(id) ON DELETE CASCADE,
      id varchar PRIMARY KEY,
      key varchar NOT NULL,
      description varchar
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS campus_content_strings_locales (
      value varchar NOT NULL,
      id serial PRIMARY KEY,
      _locale ${quoteIdent(schema)}._locales NOT NULL,
      _parent_id varchar NOT NULL REFERENCES campus_content_strings(id) ON DELETE CASCADE
    )
  `);
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE campus_content_strings_locales
        ADD CONSTRAINT campus_content_strings_locales_locale_parent_unique UNIQUE (_parent_id, _locale);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  console.log('  ensured campus_global + campus_content tables');

  // Payload admin document lock queries need rel columns for each collection.
  await client.query(`
    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN IF NOT EXISTS campus_content_id integer
  `);
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_campus_content_fk
        FOREIGN KEY (campus_content_id) REFERENCES campus_content(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_campus_content_id_idx
      ON payload_locked_documents_rels (campus_content_id)
  `);
}

async function backfillTourUk(client: import('pg').Client, schema: string) {
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE campus_tours_steps_locales
        ADD CONSTRAINT campus_tours_steps_locales_locale_parent_unique UNIQUE (_parent_id, _locale);
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);

  for (const tour of CAMPUS_TOUR_SEED) {
    const parent = await client.query<{ id: number }>(
      `SELECT id FROM campus_tours WHERE track_id = $1`,
      [tour.trackId],
    );
    if (!parent.rows[0]) continue;
    for (const step of tour.steps) {
      const stepRow = await client.query<{ id: string }>(
        `SELECT id FROM campus_tours_steps WHERE _parent_id = $1 AND step_id = $2`,
        [parent.rows[0].id, step.stepId],
      );
      if (!stepRow.rows[0]) continue;
      const stepId = stepRow.rows[0].id;
      const uk = step.locales.uk;
      await client.query(
        `INSERT INTO campus_tours_steps_locales (title, body, cta_label, _locale, _parent_id)
         VALUES ($1, $2, $3, $4::${quoteIdent(schema)}._locales, $5)
         ON CONFLICT (_parent_id, _locale) DO UPDATE SET
           title = EXCLUDED.title,
           body = EXCLUDED.body,
           cta_label = EXCLUDED.cta_label`,
        [uk.title, uk.body, uk.ctaLabel ?? null, 'uk', stepId],
      );
    }
    console.log(`  tour uk backfill: ${tour.trackId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
