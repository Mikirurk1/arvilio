/**
 * Add SEO columns + redirects for Hub/Campus.
 * Safe to re-run (IF NOT EXISTS). Prefer this over PAYLOAD_PUSH.
 *
 * Run: npm run migrate:seo -w @app/cms
 */
function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

async function columnExists(
  client: { query: (q: string, p?: unknown[]) => Promise<{ rows: Array<{ exists: boolean }> }> },
  schema: string,
  table: string,
  column: string,
): Promise<boolean> {
  const r = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
    ) AS exists`,
    [schema, table, column],
  );
  return Boolean(r.rows[0]?.exists);
}

async function tableExists(
  client: { query: (q: string, p?: unknown[]) => Promise<{ rows: Array<{ exists: boolean }> }> },
  schema: string,
  table: string,
): Promise<boolean> {
  const r = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = $1 AND table_name = $2
    ) AS exists`,
    [schema, table],
  );
  return Boolean(r.rows[0]?.exists);
}

async function addColumn(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: { query: (q: string, p?: unknown[]) => Promise<any> },
  schema: string,
  table: string,
  column: string,
  ddl: string,
): Promise<void> {
  if (await columnExists(client, schema, table, column)) {
    console.log(`  skip ${table}.${column}`);
    return;
  }
  await client.query(
    `ALTER TABLE ${quoteIdent(schema)}.${quoteIdent(table)} ADD COLUMN ${quoteIdent(column)} ${ddl}`,
  );
  console.log(`  + ${table}.${column}`);
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

    // --- Hub site-settings ---
    await addColumn(client, schema, 'site_settings', 'title_template', `varchar DEFAULT '%s | Arvilio'`);
    await addColumn(client, schema, 'site_settings', 'twitter_handle', 'varchar');
    await addColumn(client, schema, 'site_settings', 'robots_index_default', 'boolean DEFAULT true');
    await addColumn(client, schema, 'site_settings', 'google_site_verification', 'varchar');
    await addColumn(client, schema, 'site_settings', 'bing_site_verification', 'varchar');
    await addColumn(client, schema, 'site_settings', 'public_base_url', 'varchar');
    await addColumn(
      client,
      schema,
      'site_settings',
      'twitter_card_default',
      `varchar DEFAULT 'summary_large_image'`,
    );
    await addColumn(client, schema, 'site_settings', 'facebook_app_id', 'varchar');
    await addColumn(client, schema, 'site_settings', 'website_json_ld_enabled', 'boolean DEFAULT true');
    await addColumn(client, schema, 'site_settings', 'search_action_url', 'varchar');
    await addColumn(client, schema, 'site_settings', 'sitemap_enabled', 'boolean DEFAULT true');
    await addColumn(client, schema, 'site_settings', 'robots_txt_extra', 'varchar');

    if (!(await tableExists(client, schema, 'site_settings_locales'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.site_settings_locales (
          id serial PRIMARY KEY,
          site_name varchar,
          default_seo_description varchar,
          _locale ${quoteIdent(schema)}._locales NOT NULL,
          _parent_id integer NOT NULL REFERENCES ${quoteIdent(schema)}.site_settings(id) ON DELETE CASCADE,
          UNIQUE (_locale, _parent_id)
        )
      `);
      console.log('  + site_settings_locales');
    } else {
      await addColumn(client, schema, 'site_settings_locales', 'site_name', 'varchar');
      await addColumn(client, schema, 'site_settings_locales', 'default_seo_description', 'varchar');
    }

    if (!(await tableExists(client, schema, 'site_settings_robots_disallow'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.site_settings_robots_disallow (
          id serial PRIMARY KEY,
          _order integer NOT NULL,
          _parent_id integer NOT NULL REFERENCES ${quoteIdent(schema)}.site_settings(id) ON DELETE CASCADE,
          path varchar NOT NULL
        )
      `);
      console.log('  + site_settings_robots_disallow');
    }

    // --- Document SEO (pages / products / campus-content) ---
    for (const table of ['pages', 'products', 'campus_content'] as const) {
      await addColumn(client, schema, table, 'canonical_path', 'varchar');
      await addColumn(client, schema, table, 'no_index', 'boolean DEFAULT false');
      await addColumn(client, schema, table, 'no_follow', 'boolean DEFAULT false');
      await addColumn(client, schema, table, 'sitemap_include', 'boolean DEFAULT true');
      await addColumn(client, schema, table, 'sitemap_priority', 'numeric');
      await addColumn(client, schema, table, 'sitemap_change_frequency', 'varchar');
      await addColumn(client, schema, table, 'json_ld_type', `varchar DEFAULT 'none'`);
      await addColumn(
        client,
        schema,
        table,
        'twitter_image_id',
        `integer REFERENCES ${quoteIdent(schema)}.media(id) ON DELETE SET NULL`,
      );
    }

    await addColumn(
      client,
      schema,
      'campus_content',
      'og_image_id',
      `integer REFERENCES ${quoteIdent(schema)}.media(id) ON DELETE SET NULL`,
    );

    for (const localesTable of [
      'pages_locales',
      'products_locales',
      'campus_content_locales',
    ] as const) {
      await addColumn(client, schema, localesTable, 'seo_title', 'varchar');
      await addColumn(client, schema, localesTable, 'seo_description', 'varchar');
      await addColumn(client, schema, localesTable, 'breadcrumb_label', 'varchar');
    }

    if (!(await tableExists(client, schema, 'pages_faq_items'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.pages_faq_items (
          id serial PRIMARY KEY,
          _order integer NOT NULL,
          _parent_id integer NOT NULL REFERENCES ${quoteIdent(schema)}.pages(id) ON DELETE CASCADE
        )
      `);
      console.log('  + pages_faq_items');
    }
    if (!(await tableExists(client, schema, 'pages_faq_items_locales'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.pages_faq_items_locales (
          id serial PRIMARY KEY,
          question varchar,
          answer varchar,
          _locale ${quoteIdent(schema)}._locales NOT NULL,
          _parent_id integer NOT NULL REFERENCES ${quoteIdent(schema)}.pages_faq_items(id) ON DELETE CASCADE,
          UNIQUE (_locale, _parent_id)
        )
      `);
      console.log('  + pages_faq_items_locales');
    }

    // --- Campus global ---
    await addColumn(client, schema, 'campus_global', 'title_template', `varchar DEFAULT '%s | Campus'`);
    await addColumn(client, schema, 'campus_global', 'twitter_handle', 'varchar');
    await addColumn(client, schema, 'campus_global', 'robots_index_default', 'boolean DEFAULT true');
    await addColumn(client, schema, 'campus_global', 'public_base_url', 'varchar');
    await addColumn(
      client,
      schema,
      'campus_global',
      'twitter_card_default',
      `varchar DEFAULT 'summary_large_image'`,
    );
    await addColumn(client, schema, 'campus_global', 'google_site_verification', 'varchar');
    await addColumn(client, schema, 'campus_global', 'bing_site_verification', 'varchar');
    await addColumn(
      client,
      schema,
      'campus_global',
      'og_default_image_id',
      `integer REFERENCES ${quoteIdent(schema)}.media(id) ON DELETE SET NULL`,
    );

    if (!(await tableExists(client, schema, 'campus_global_locales'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.campus_global_locales (
          id serial PRIMARY KEY,
          site_name varchar,
          default_seo_description varchar,
          _locale ${quoteIdent(schema)}._locales NOT NULL,
          _parent_id integer NOT NULL REFERENCES ${quoteIdent(schema)}.campus_global(id) ON DELETE CASCADE,
          UNIQUE (_locale, _parent_id)
        )
      `);
      console.log('  + campus_global_locales');
    } else {
      await addColumn(client, schema, 'campus_global_locales', 'site_name', 'varchar');
      await addColumn(client, schema, 'campus_global_locales', 'default_seo_description', 'varchar');
    }

    // --- Redirects collection ---
    if (!(await tableExists(client, schema, 'redirects'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.redirects (
          id serial PRIMARY KEY,
          from_path varchar NOT NULL UNIQUE,
          to_path varchar,
          to_url varchar,
          status_code varchar NOT NULL DEFAULT '301',
          enabled boolean DEFAULT true,
          updated_at timestamptz NOT NULL DEFAULT now(),
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `);
      console.log('  + redirects');
    }

    if (await tableExists(client, schema, 'payload_locked_documents_rels')) {
      await addColumn(
        client,
        schema,
        'payload_locked_documents_rels',
        'redirects_id',
        `integer REFERENCES ${quoteIdent(schema)}.redirects(id) ON DELETE CASCADE`,
      );
    }

    // --- Media imageSizes (og / logo / thumb) from Phase 5 ---
    if (await tableExists(client, schema, 'media')) {
      for (const size of ['og', 'logo', 'thumb'] as const) {
        await addColumn(client, schema, 'media', `sizes_${size}_url`, 'varchar');
        await addColumn(client, schema, 'media', `sizes_${size}_width`, 'numeric');
        await addColumn(client, schema, 'media', `sizes_${size}_height`, 'numeric');
        await addColumn(client, schema, 'media', `sizes_${size}_mime_type`, 'varchar');
        await addColumn(client, schema, 'media', `sizes_${size}_filesize`, 'numeric');
        await addColumn(client, schema, 'media', `sizes_${size}_filename`, 'varchar');
      }
    }

    // Seed Hub site SEO locale rows
    const parent = await client.query<{ id: number }>(
      `SELECT id FROM ${quoteIdent(schema)}.site_settings ORDER BY id ASC LIMIT 1`,
    );
    const parentId = parent.rows[0]?.id;
    if (parentId != null) {
      for (const [locale, siteName, desc] of [
        ['en', 'Arvilio', 'Campus for schools. Connect for learners — coming soon.'],
        ['uk', 'Arvilio', 'Campus для шкіл. Connect для учнів — незабаром.'],
      ] as const) {
        await client.query(
          `
          INSERT INTO ${quoteIdent(schema)}.site_settings_locales
            (site_name, default_seo_description, _locale, _parent_id)
          VALUES ($1, $2, $3::${quoteIdent(schema)}._locales, $4)
          ON CONFLICT (_locale, _parent_id) DO UPDATE SET
            site_name = COALESCE(${quoteIdent(schema)}.site_settings_locales.site_name, EXCLUDED.site_name),
            default_seo_description = COALESCE(
              ${quoteIdent(schema)}.site_settings_locales.default_seo_description,
              EXCLUDED.default_seo_description
            )
          `,
          [siteName, desc, locale, parentId],
        );
      }
      console.log('  seeded site_settings_locales SEO defaults');
    }

    console.log('migrate:seo done');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
