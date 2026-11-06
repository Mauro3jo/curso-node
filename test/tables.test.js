import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { table } from '../ejercicios/09-tablas/table.js';
import { getEmployee, getSalary, employeeCallback } from '../ejercicios/01-fundamentos/async.js';

test('genera una tabla y el CLI guarda el archivo sin aceptar argumentos inválidos', t => {
  assert.equal(table(3, 2), '3 x 1 = 3\n3 x 2 = 6\n');
  assert.throws(() => table(3, -1), /entero/i);
  const dir = mkdtempSync(join(tmpdir(), 'node-tablas-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'tabla.txt');
  const args = ['ejercicios/09-tablas/cli.js', '--base', '5', '--hasta', '3', '--salida', file, '--listar'];
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(file, 'utf8'), table(5, 3));
  assert.match(result.stdout, /5 x 3 = 15/);
  const invalid = spawnSync(process.execPath, ['ejercicios/09-tablas/cli.js', '--base', 'abc'], { encoding: 'utf8' });
  assert.notEqual(invalid.status, 0);
});

test('callbacks, promesas y async/await resuelven y propagan errores', async () => {
  const employee = await getEmployee(1);
  assert.equal(employee.nombre, 'Mauro');
  assert.equal(await getSalary(employee.id), 1000);
  await assert.rejects(getEmployee(99), /empleado/i);
  await assert.rejects(getSalary(99), /salario/i);
  const result = await new Promise((resolve, reject) => employeeCallback(1, (error, value) => error ? reject(error) : resolve(value)));
  assert.deepEqual(result, employee);
});
