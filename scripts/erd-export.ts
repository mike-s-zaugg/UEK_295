import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

function toTableName(name: string) {
  return name.replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
}

function sqlTypeFromColumn(col: { type: unknown }): string {
  const t = col.type;
  if (typeof t === 'string') {
    return t;
  }
  // best effort
  if (typeof t === 'function' && t.name === 'string')
    return t.name.toLowerCase();
  return 'unknown';
}

function buildErdForEntities(dataSource: DataSource) {
  const metas = dataSource.entityMetadatas;

  let out = 'erDiagram\n';

  // Tabellen + Spalten
  for (const m of metas) {
    const table = toTableName(m.tableName || m.name);
    out += `  ${table} {\n`;

    const uniqueColumns = new Set(
      m.uniques.flatMap((u) => u.columns.map((c) => c.databaseName)),
    );

    for (const c of m.columns) {
      const t = sqlTypeFromColumn(c);
      const pk = c.isPrimary ? ' PK' : '';
      const uq = uniqueColumns.has(c.databaseName) ? ' UK' : '';
      out += `    ${t} ${c.databaseName}${pk}${uq}\n`;
    }

    out += `  }\n\n`;
  }

  // Relations
  // Mermaid Cardinalities: ||--o{ etc.
  // TypeORM relation types: many-to-one, one-to-many, one-to-one, many-to-many
  const relLine = (
    a: string,
    left: string,
    right: string,
    b: string,
    label: string,
  ) => `  ${a} ${left}--${right} ${b} : "${label}"\n`;

  for (const m of metas) {
    const fromTable = toTableName(m.tableName || m.name);

    for (const r of m.relations) {
      const toTable = toTableName(
        r.inverseEntityMetadata.tableName || r.inverseEntityMetadata.name,
      );
      const name = r.propertyName;

      // Heuristik Mermaid-Kardinalitäten
      // many-to-one:  A }o--|| B
      // one-to-many:  A ||--o{ B   (aber Richtung ist “one on A side” je nach Owner; hier best-effort)
      // one-to-one:   A ||--|| B
      // many-to-many: A }o--o{ B
      let left = '||';
      let right = '||';

      if (r.relationType === 'many-to-one') {
        left = '}o';
        right = '||';
      }
      if (r.relationType === 'one-to-many') {
        left = '||';
        right = 'o{';
      }
      if (r.relationType === 'one-to-one') {
        left = '||';
        right = '||';
      }
      if (r.relationType === 'many-to-many') {
        left = '}o';
        right = 'o{';
      }

      // Doppelte Kanten vermeiden (z.B. one-to-many + many-to-one beidseitig)
      // Owner bevorzugen: joinColumns nur auf owning side
      const isOwningSide =
        r.isOwning || r.joinColumns?.length > 0 || r.isManyToManyOwner;
      if (!isOwningSide) continue;

      out += relLine(fromTable, left, right, toTable, name);
    }
  }

  out += '\n';
  return out;
}

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const dataSource = app.get(DataSource);

  const erd = buildErdForEntities(dataSource);

  mkdirSync('docs', { recursive: true });
  writeFileSync(join('docs', '_erd.mmd.md'), `# ERD (Global)\n\n${erd}`);

  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
