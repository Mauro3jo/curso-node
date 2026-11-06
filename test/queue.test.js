import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Queue } from '../src/queue.js';

function setup(t, clock) {
  const dir = mkdtempSync(join(tmpdir(), 'turnos-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'queue.json');
  return { file, queue: new Queue(file, clock) };
}

test('atiende en orden y conserva los cuatro llamados más recientes', t => {
  const { queue } = setup(t);
  for (let i = 1; i <= 6; i++) assert.equal(queue.next().numero, i);
  for (let i = 1; i <= 6; i++) assert.deepEqual(queue.attend('A'), { numero: i, escritorio: 'A' });
  assert.equal(queue.attend('A'), null);
  assert.deepEqual(queue.snapshot().ultimos4.map(x => x.numero), [6, 5, 4, 3]);
  assert.equal(queue.snapshot().pendientes, 0);
});

test('restaura pendientes y llamados al reiniciar', t => {
  const { queue, file } = setup(t);
  queue.next(); queue.next(); queue.attend('2');
  const restored = new Queue(file);
  assert.deepEqual(restored.snapshot(), queue.snapshot());
  assert.equal(restored.attend('3').numero, 2);
});

test('reinicia al cambiar la fecha completa, incluso con el mismo día del mes', t => {
  let now = new Date(2026, 9, 6, 12);
  const { queue } = setup(t, () => now);
  queue.next(); queue.attend('1'); queue.next();
  now = new Date(2026, 10, 6, 12);
  assert.deepEqual(queue.snapshot(), { ultimo: 0, pendientes: 0, ultimos4: [] });
  assert.equal(queue.next().numero, 1);
});

test('rechaza escritorios inválidos sin consumir turnos', t => {
  const { queue } = setup(t);
  queue.next();
  for (const value of [null, {}, 4, '', '  ', 'a'.repeat(41)]) assert.throws(() => queue.attend(value), /escritorio/i);
  assert.equal(queue.snapshot().pendientes, 1);
  assert.equal(queue.attend('  Caja 1  ').escritorio, 'Caja 1');
});

test('no sobrescribe un archivo corrupto al iniciar', t => {
  const { file } = setup(t);
  writeFileSync(file, '{roto');
  assert.throws(() => new Queue(file), /JSON/);
  assert.equal(readFileSync(file, 'utf8'), '{roto');
});

test('no expone referencias mutables del estado', t => {
  const { queue } = setup(t);
  const ticket = queue.next(); ticket.numero = 999;
  queue.attend('1');
  queue.snapshot().ultimos4[0].numero = 888;
  assert.equal(queue.snapshot().ultimos4[0].numero, 1);
});

test('rechaza un JSON válido con una estructura incorrecta', t => {
  const { file } = setup(t);
  writeFileSync(file, '{}');
  assert.throws(() => new Queue(file), /formato inválido/);
  assert.equal(readFileSync(file, 'utf8'), '{}');
});

test('un fallo al guardar no confirma ni consume un número', t => {
  const { file } = setup(t);
  const queue = new Queue(join(file, 'queue.json'));
  writeFileSync(file, 'bloqueo');
  assert.throws(() => queue.next());
  assert.equal(queue.snapshot().ultimo, 0);
});
