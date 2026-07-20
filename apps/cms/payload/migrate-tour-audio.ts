/**
 * Add campus-tour-audio upload collection + localized voice on tour steps.
 * Safe to re-run (IF NOT EXISTS). Prefer this over PAYLOAD_PUSH.
 *
 * Run: npm run migrate:tour-audio -w @app/cms
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

async function constraintExists(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: { query: (q: string, p?: unknown[]) => Promise<any> },
  schema: string,
  table: string,
  name: string,
): Promise<boolean> {
  const r = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_schema = $1 AND table_name = $2 AND constraint_name = $3
    ) AS exists`,
    [schema, table, name],
  );
  return Boolean(r.rows[0]?.exists);
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
    console.log(`migrate:tour-audio schema=${schema}`);

    if (!(await tableExists(client, schema, 'campus_tour_audio'))) {
      await client.query(`
        CREATE TABLE ${quoteIdent(schema)}.campus_tour_audio (
          id serial PRIMARY KEY,
          label character varying,
          updated_at timestamp(3) with time zone NOT NULL DEFAULT now(),
          created_at timestamp(3) with time zone NOT NULL DEFAULT now(),
          url character varying,
          thumbnail_u_r_l character varying,
          filename character varying,
          mime_type character varying,
          filesize numeric,
          width numeric,
          height numeric,
          focal_x numeric,
          focal_y numeric
        )
      `);
      await client.query(
        `CREATE UNIQUE INDEX campus_tour_audio_filename_idx ON ${quoteIdent(schema)}.campus_tour_audio (filename)`,
      );
      await client.query(
        `CREATE INDEX campus_tour_audio_updated_at_idx ON ${quoteIdent(schema)}.campus_tour_audio (updated_at)`,
      );
      await client.query(
        `CREATE INDEX campus_tour_audio_created_at_idx ON ${quoteIdent(schema)}.campus_tour_audio (created_at)`,
      );
      console.log('  + campus_tour_audio');
    } else {
      console.log('  skip campus_tour_audio');
    }

    await addColumn(client, schema, 'campus_tours_steps_locales', 'voice_id', 'integer');

    if (
      !(await constraintExists(
        client,
        schema,
        'campus_tours_steps_locales',
        'campus_tours_steps_locales_voice_id_campus_tour_audio_id_fk',
      ))
    ) {
      await client.query(`
        ALTER TABLE ${quoteIdent(schema)}.campus_tours_steps_locales
        ADD CONSTRAINT campus_tours_steps_locales_voice_id_campus_tour_audio_id_fk
        FOREIGN KEY (voice_id) REFERENCES ${quoteIdent(schema)}.campus_tour_audio(id)
        ON DELETE SET NULL
      `);
      console.log('  + FK voice_id → campus_tour_audio');
    }
    await client.query(`
      CREATE INDEX IF NOT EXISTS campus_tours_steps_locales_voice_idx
        ON ${quoteIdent(schema)}.campus_tours_steps_locales (voice_id)
    `);

    await addColumn(
      client,
      schema,
      'payload_locked_documents_rels',
      'campus_tour_audio_id',
      'integer',
    );
    if (
      !(await constraintExists(
        client,
        schema,
        'payload_locked_documents_rels',
        'payload_locked_documents_rels_campus_tour_audio_fk',
      ))
    ) {
      await client.query(`
        ALTER TABLE ${quoteIdent(schema)}.payload_locked_documents_rels
        ADD CONSTRAINT payload_locked_documents_rels_campus_tour_audio_fk
        FOREIGN KEY (campus_tour_audio_id) REFERENCES ${quoteIdent(schema)}.campus_tour_audio(id)
        ON DELETE CASCADE
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_campus_tour_audio_id_idx
          ON ${quoteIdent(schema)}.payload_locked_documents_rels (campus_tour_audio_id)
      `);
      console.log('  + locked_documents_rels.campus_tour_audio_id FK');
    }

    console.log('migrate:tour-audio done');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
