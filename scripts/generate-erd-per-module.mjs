// scripts/generate-erd-per-module.mjs
//
// Generates Mermaid ERD per module (docs/<module>/_erd.md)
// - Detects module entities from TypeOrmModule.forFeature([...]) via extract-module-entities.mjs
// - Reads TypeORM metadata JSON via scripts/print-typeorm-metadata.ts
// - Renders:
//   - PK markers
//   - UK markers for single-column and multi-column UNIQUE constraints (best-effort)
//   - Composite UNIQUE constraints as Mermaid comments (%% UNIQUE: (...))
//   - Relations (owning side only), and optionally includes external related tables
//
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import * as util from './util.mjs';

function toTableName(name) {
  return String(name)
    .replace(/[^A-Za-z0-9_]/g, '_')
    .toUpperCase();
}

function buildErdForEntityMetas(metas, includeExternalRelations = true) {
  const includedTables = new Set(
    metas.map((m) => toTableName(m.tableName || m.name)),
  );

  let out = 'erDiagram\n';

  // helper to compute unique columns + composite unique constraints
  function uniqueInfoForMeta(m) {
    const uniques = Array.isArray(m.uniques) ? m.uniques : [];
    const uniqueCols = new Set();

    // Mark columns as unique-key if they appear in ANY unique constraint.
    // Note: Mermaid ERD has no formal unique syntax; The "UK" marker is a convention.
    for (const u of uniques) {
      const cols = Array.isArray(u.columns) ? u.columns : [];
      for (const col of cols) uniqueCols.add(col);
    }

    const compositeUniques = uniques
      .filter((u) => Array.isArray(u.columns) && u.columns.length > 1)
      .map((u) => ({
        name: u.name ?? null,
        columns: u.columns,
      }));

    return { uniqueCols, compositeUniques };
  }

  // add table definition
  function renderTable(m, isExternal = false) {
    const table = toTableName(m.tableName || m.name);

    if (isExternal) {
      out += `  %% referenced from other module\n`;
    }

    const cols = Array.isArray(m.columns) ? m.columns : [];
    const { uniqueCols, compositeUniques } = uniqueInfoForMeta(m);

    out += `  ${table} {\n`;
    for (const c of cols) {
      const t = c.type ?? 'unknown';
      const pk = c.isPrimary ? ' PK' : '';
      const uk = uniqueCols.has(c.databaseName) ? ' UK' : '';
      out += `    ${t} ${c.databaseName}${pk}${uk}\n`;
    }
    out += '  }\n';

    // Composite uniques as comments (helpful & readable)
    // Mermaid ignores comments, but they remain visible in source.
    for (const u of compositeUniques) {
      const colsList = u.columns.join(', ');
      const name = u.name ? ` (${u.name})` : '';
      out += `  %% UNIQUE${name}: (${colsList})\n`;
    }
  }

  // 1) render included tables
  for (const m of metas) renderTable(m);

  // 2) relations (owning side only) + optionally include external tables
  const addedExternalTables = new Set();

  function renderExternalTable(invMeta) {
    const tName = toTableName(invMeta.tableName || invMeta.name);
    if (includedTables.has(tName) || addedExternalTables.has(tName)) return;
    addedExternalTables.add(tName);

    // For external tables, we still want uniques if available (metadata provides it)
    renderTable(invMeta, true);
  }

  const relLine = (a, left, right, b, label) =>
    `  ${a} ${left}--${right} ${b} : "${label}"\n`;

  for (const m of metas) {
    const fromTable = toTableName(m.tableName || m.name);
    const relations = Array.isArray(m.relations) ? m.relations : [];

    for (const r of relations) {
      const inv = r.inverseEntityMetadata;
      if (!inv) continue;

      const toTable = toTableName(inv.tableName || inv.name);

      // owning side heuristic: either isOwning or joinColumnsCount > 0
      const isOwningSide =
        Boolean(r.isOwning) || Number(r.joinColumnsCount ?? 0) > 0;

      if (!isOwningSide) continue;

      const targetInModule = includedTables.has(toTable);

      if (!targetInModule) {
        if (!includeExternalRelations) continue;
        renderExternalTable(inv);
      }

      // Mermaid cardinalities (best-effort)
      // many-to-one:  A }o--|| B
      // one-to-many:  A ||--o{ B
      // one-to-one:   A ||--|| B
      // many-to-many: A }o--o{ B
      let left = '||';
      let right = '||';
      switch (r.relationType) {
        case 'many-to-one':
          left = '}o';
          right = '||';
          break;
        case 'one-to-many':
          left = '||';
          right = 'o{';
          break;
        case 'one-to-one':
          left = '||';
          right = '||';
          break;
        case 'many-to-many':
          left = '}o';
          right = 'o{';
          break;
        default:
          // leave as ||--|| for unknown relation types
          left = '||';
          right = '||';
      }

      out += relLine(fromTable, left, right, toTable, r.propertyName || '');
    }
  }

  out += '\n';
  return out;
}

// ---------- main ----------
function run(cmd) {
  return execSync(cmd, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });
}

// helper: get entity metas by entity class name
function metasForEntityNames(names) {
  const set = new Set(names);
  return allMetas.filter((m) => set.has(m.name));
}


// 1) module -> entityNames map
const moduleEntityMap = JSON.parse(
  run('node scripts/extract-module-entities.mjs'),
);

// 2) typeorm metadata JSON
// const metaOut = run(
//   'ts-node -r tsconfig-paths/register scripts/print-typeorm-metadata.ts',
// );

const meta = await util.runCommand(
  'tsx',
  ['-r', 'tsconfig-paths/register', 'scripts/print-typeorm-metadata.ts'],
  {
    env: {
      ...process.env,
      NODE_ENV: 'development',
      DB_IN_MEMORY: 'true',
    },
  },
);

const metaOut = meta.stdout;

// take the last non-empty line as JSON
const lastLine = metaOut
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean)
  .at(-1);

if (!lastLine) {
  throw new Error('No JSON output from print-typeorm-metadata.ts');
}

const allMetas = JSON.parse(lastLine);

fs.mkdirSync('docs', { recursive: true });

for (const [moduleName, entityNames] of Object.entries(moduleEntityMap)) {
  const metas = metasForEntityNames(entityNames);
  if (!metas.length) continue;

  let erd = buildErdForEntityMetas(metas, true);
  // sanitize
  erd = erd.replace(/\n\n/g, '\n');

  const dir = path.join('docs', moduleName, 'entities');
  fs.mkdirSync(dir, { recursive: true });

  const outPath = path.join(dir, '_erd.mmd');
  fs.writeFileSync(outPath, erd, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);

  // additional: Entity-Metadata für README export
  const entityJsonPath = path.join(dir, '_entities.json');
  fs.writeFileSync(entityJsonPath, JSON.stringify(metas, null, 2), 'utf8');
  console.log(`Wrote ${entityJsonPath}`);

}