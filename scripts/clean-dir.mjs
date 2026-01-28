// clean-docs.mjs
import { rimraf } from 'rimraf';

/**
 * Löscht den Inhalt eines Verzeichnisses, aber nicht das Verzeichnis selbst.
 * @param {string} dir z.B. "docs"
 * @param {string[]} keep z.B. [".gitkeep"]
 */
export async function cleanDir(dir, keep = ['.gitkeep']) {
  const ignore = keep.map((name) => `${dir}/${name}`);

  await rimraf(`${dir}/**/*`, {
    glob: {
      dot: true,
      ignore,
    },
  });

  console.log(`${dir} cleaned (except ${keep.join(', ')})`);
}

// CLI Nutzung: node scripts/clean-dir.mjs docs
const dir = process.argv[2];
if (dir) {
  await cleanDir(dir);
}