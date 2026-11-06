import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

let count = 0;
function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'dist') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) check(path);
    else if (entry.name.endsWith('.js')) { execFileSync(process.execPath, ['--check', path]); count++; }
  }
}
for (const directory of ['src', 'public', 'lib', 'ejercicios', 'test', 'test-support', 'scripts']) check(directory);
console.log(`Sintaxis verificada: ${count} archivos JavaScript`);
