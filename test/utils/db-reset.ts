import { DataSource } from 'typeorm';

export async function resetDatabase(ds: DataSource) {
  // drop + recreate schema
  await ds.synchronize(true);
}
