import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

function normalizeColumnType(type: unknown): string {
  if (typeof type === 'string') return type;
  if (typeof type === 'function' && typeof type.name === 'string') {
    return type.name.toLowerCase();
  }
  return 'unknown';
}

async function main() {
  // IMPORTANT: disable Nest logs while generating metadata
  const app = await NestFactory.create(AppModule, { logger: false });

  // IMPORTANT: ensure TypeORM does not spam query logs to stdout
  const ds = app.get(DataSource);
  // TypeORM logger is internal; safest cross-version method:
  // - If your DataSource options enable logging, disable it at runtime
  // - This prevents query logs during this script's execution
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opts = ds.options as any;
  if (opts) opts.logging = false;

  // Re-initialize not needed; logging flag mainly affects runtime logging calls.
  // If you still get logs, we will switch JSON output to a file in next step.

  const metas = ds.entityMetadatas.map((m) => ({
    name: m.name,
    tableName: m.tableName,
    columns: m.columns.map((c) => ({
      databaseName: c.databaseName,
      type: normalizeColumnType(c.type),
      isPrimary: c.isPrimary,
    })),
    uniques: m.uniques.map((u) => ({
      name: u.name ?? null,
      columns: u.columns.map((c) => c.databaseName),
    })),
    relations: m.relations.map((r) => ({
      propertyName: r.propertyName,
      relationType: r.relationType,
      isOwning: r.isOwning,
      joinColumnsCount: r.joinColumns?.length ?? 0,
      inverseEntityMetadata: {
        name: r.inverseEntityMetadata.name,
        tableName: r.inverseEntityMetadata.tableName,
        columns: r.inverseEntityMetadata.columns.map((c) => ({
          databaseName: c.databaseName,
          type: normalizeColumnType(c.type),
          isPrimary: c.isPrimary,
        })),
      },
    })),
  }));

  // Output ONLY JSON to stdout
  process.stdout.write(JSON.stringify(metas));
  await app.close();
}

main().catch((e) => {
  // write errors to stderr only (so stdout stays JSON if partially written)
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
