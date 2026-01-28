// src/util.ts
import { spawn } from 'child_process';
import os from 'node:os';

const quiet = true;

export function toAnchorId(title) {
  return title
    .toLowerCase()
    .normalize('NFKD') // Umlaute/Diakritika robuster
    .replace(/[\u0300-\u036f]/g, '') // entfernt Akzentzeichen
    .replace(/\[[^\]]*]/g, (m) => m.replace(/[[\]]/g, '')) // [] Inhalt behalten, Klammern weg
    .replace(/[{}]/g, '') // {} weg
    .replace(/[^a-z0-9]+/g, '-') // alles Nicht-Alnum => "-"
    .replace(/-+/g, '-') // mehrfach "-" => "-"
    .replace(/^-|-$/g, ''); // trim "-"
}

// optional: prüfe ob ein binary verfügbar ist
export async function assertCommand(cmd, hint) {
  try {
    await runCommand(cmd, ['--version']);
  } catch (e) {
    throw new Error(`Fehlt: ${cmd}. ${hint ?? ''}\nUrsache: ${e.message}`);
  }
}

export function normalizeCommand(cmd) {
  if (os.platform() === 'win32') {
    // pandoc und xelatex sind unter Windows echte .exe
    if (cmd.toLowerCase() === 'pandoc') return 'pandoc.exe';
    if (cmd.toLowerCase() === 'xelatex') return 'xelatex.exe';
    if (cmd.toLowerCase() === 'mmdc') return 'mmdc.cmd'; // falls via npm installiert
  }
  return cmd;
}

export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(normalizeCommand(command), args, {
      stdio: quiet ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      shell: os.platform() === 'win32',
      windowsHide: true,
      ...options,
    });

    let out = '';
    let err = '';

    if (child.stdout) child.stdout.on('data', (d) => (out += d.toString()));
    if (child.stderr) child.stderr.on('data', (d) => (err += d.toString()));

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: out, stderr: err });
      } else {
        reject(
          new Error(
            `${command} exited with code ${code}\n\n--- STDOUT ---\n${out}\n\n--- STDERR ---\n${err}`,
          ),
        );
      }
    });
  });
}

