// scripts/extract-module-entities.mjs
import fg from 'fast-glob';
import path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

const moduleFiles = await fg(['src/modules/**/*.module.ts'], { dot: false });

function getModuleNameFromPath(file) {
  const parts = file.split(path.sep);
  const idx = parts.indexOf('modules');
  return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : 'root';
}

function isTypeOrmForFeatureCall(call) {
  const expr = call.getExpression();
  if (expr.getKind() !== SyntaxKind.PropertyAccessExpression) return false;

  const pae = expr.asKindOrThrow(SyntaxKind.PropertyAccessExpression);
  const left = pae.getExpression().getText();
  const right = pae.getName();

  return left.endsWith('TypeOrmModule') && right === 'forFeature';
}

function extractEntitiesFromForFeature(call) {
  const args = call.getArguments();
  if (!args.length) return [];

  // forFeature([A, B, ...])
  const arr = args[0].asKind(SyntaxKind.ArrayLiteralExpression);
  if (!arr) return [];

  return arr.getElements().map((e) => e.getText().trim());
}

const result = {}; // moduleName -> [EntityClassNames]

for (const file of moduleFiles) {
  const sf = project.addSourceFileAtPath(file);
  const moduleName = getModuleNameFromPath(file);

  const entities = new Set(result[moduleName] || []);

  const calls = sf.getDescendantsOfKind(SyntaxKind.CallExpression);
  for (const call of calls) {
    if (!isTypeOrmForFeatureCall(call)) continue;

    for (const name of extractEntitiesFromForFeature(call)) {
      if (name) entities.add(name);
    }
  }

  if (entities.size) result[moduleName] = [...entities];
}

process.stdout.write(JSON.stringify(result, null, 2));
