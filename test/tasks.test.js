import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Tasks } from '../ejercicios/02-tareas/tasks.js';

test('crea, completa, filtra, reabre y borra tareas persistentes', t => {
  const dir = mkdtempSync(join(tmpdir(), 'node-tareas-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'tasks.json');
  const tasks = new Tasks(file);
  const a = tasks.add('  Estudiar Node  '), b = tasks.add('Practicar');
  assert.throws(() => tasks.add(' '), /descripción/i);
  tasks.complete([a.id]);
  assert.equal(tasks.list('completadas')[0].desc, 'Estudiar Node');
  assert.equal(tasks.list('pendientes')[0].id, b.id);
  assert.equal(new Tasks(file).list('completadas').length, 1);
  tasks.complete([]);
  assert.equal(tasks.list('pendientes').length, 2);
  assert.throws(() => tasks.remove('inexistente'), /existe/i);
  tasks.remove(a.id);
  assert.equal(new Tasks(file).list().length, 1);
  tasks.list()[0].desc = 'cambio externo';
  assert.equal(tasks.list()[0].desc, 'Practicar');
  writeFileSync(file, '{roto');
  assert.throws(() => new Tasks(file));
  assert.equal(readFileSync(file, 'utf8'), '{roto');
});

test('la consola procesa un flujo real de entrada y restaura el archivo', t => {
  const dir = mkdtempSync(join(tmpdir(), 'node-cli-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const env = { ...process.env, TASKS_FILE: join(dir, 'tasks.json') };
  const result = spawnSync(process.execPath, ['ejercicios/02-tareas/cli.js'], { env, input: '1\nProbar consola\n2\n0\n', encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Probar consola/);
  assert.equal(new Tasks(env.TASKS_FILE).list()[0].desc, 'Probar consola');
});

test('los fundamentos muestran el orden del event loop', () => {
  const result = spawnSync(process.execPath, ['ejercicios/01-fundamentos/app.js'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.stdout.trim().split(/\r?\n/), ['Hola Mundo', 'Saludos Mauro', 'Inicio de programa', 'Fin de programa', 'Segundo Timeout', 'Tercer Timeout', 'Primer Timeout']);
});
