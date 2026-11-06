import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRestApp } from '../ejercicios/04-rest/app.js';

test('el servidor REST responde JSON y trata rutas y JSON inválidos', async t => {
  const server = createRestApp().listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${url}/health`)).json(), { ok: true });
  assert.equal((await fetch(`${url}/api/no-existe`)).status, 404);
  const bad = await fetch(`${url}/api/usuarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{roto' });
  assert.equal(bad.status, 400);
  assert.equal(typeof (await bad.json()).msg, 'string');
});
