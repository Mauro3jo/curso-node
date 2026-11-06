import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { table } from './table.js';

try {
  const options = yargs(hideBin(process.argv)).locale('es').strict().option('base', { alias: 'b', type: 'number', demandOption: true, description: 'Base entre 1 y 1000' }).option('hasta', { alias: 'h', type: 'number', default: 10 }).option('listar', { alias: 'l', type: 'boolean', default: false }).option('salida', { type: 'string' }).help().parseSync();
  const content = table(options.base, options.hasta);
  const file = options.salida || fileURLToPath(new URL(`../../data/tablas/tabla-${options.base}.txt`, import.meta.url));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
  if (options.listar) process.stdout.write(content);
  console.log(`Tabla guardada en ${file}`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
