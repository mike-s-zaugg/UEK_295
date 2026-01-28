import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = 'docs';
const OUT = path.join(DOCS_DIR, 'summary.json');

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}
function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

const folders = fs
  .readdirSync(DOCS_DIR)
  .map((name) => ({ name, full: path.join(DOCS_DIR, name) }))
  .filter((e) => isDir(e.full))
  .filter((e) => !['.git', 'node_modules'].includes(e.name))
  .sort((a, b) => a.name.localeCompare(b.name, 'de'));

const children = [];

for (const f of folders) {
  const readme = path.join(f.full, f.name+'-README.md');
  const index = path.join(f.full, 'index.md');

  if (exists(readme))
    children.push({ title: f.name, file: `${f.name}/${f.name}-README.md` });
  else if (exists(index))
    children.push({ title: f.name, file: `${f.name}/index.md` });
  // wenn weder README noch index existiert → nicht aufnehmen
}

const summary = [
  { title: 'Projektübersicht', file: 'overview.md' },
  { title: 'Module', children },
];

fs.writeFileSync(OUT, JSON.stringify(summary, null, 2), 'utf8');
console.log(`Wrote ${OUT} (${children.length} modules)`);
