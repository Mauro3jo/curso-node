import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { io as connect } from 'socket.io-client';
import { createServer } from '../src/server.js';

async function setup(t) {
  const dir = mkdtempSync(join(tmpdir(), 'turnos-server-'));
  const app = createServer({ dataFile: join(dir, 'queue.json') });
  const clients = [];
  t.after(async () => {
    clients.forEach(c => c.disconnect());
    await new Promise(resolve => app.io.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  });
  app.server.listen(0, '127.0.0.1');
  await once(app.server, 'listening');
  const url = `http://127.0.0.1:${app.server.address().port}`;
  async function client() {
    const c = connect(url, { autoConnect: false, reconnection: false });
    clients.push(c);
    const initial = once(c, 'estado-actual');
    c.connect();
    await initial;
    return c;
  }
  return { ...app, url, client };
}

test('HTTP expone salud y devuelve 404 para rutas inexistentes', { timeout: 5000 }, async t => {
  const { url } = await setup(t);
  assert.deepEqual(await (await fetch(`${url}/health`)).json(), { ok: true });
  assert.equal((await fetch(`${url}/no-existe`)).status, 404);
});

test('sirve las tres vistas y sus recursos locales sin CDN', { timeout: 5000 }, async t => {
  const { url } = await setup(t);
  for (const view of ['emitir', 'escritorio', 'pantalla']) {
    const response = await fetch(`${url}/?vista=${view}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /lang="es"/);
    assert.match(html, /\/socket.io\/socket.io.js/);
    assert.doesNotMatch(html, /https:\/\/cdn/);
  }
  for (const path of ['/app.js', '/style.css', '/socket.io/socket.io.js']) {
    assert.equal((await fetch(url + path)).status, 200);
  }
});

test('dos clientes generan y atienden turnos sin duplicar asignaciones', { timeout: 5000 }, async t => {
  const { client } = await setup(t);
  const a = await client(), b = await client();
  let update = once(b, 'estado-actual');
  assert.equal((await a.timeout(2000).emitWithAck('siguiente-ticket')).ticket.numero, 1);
  assert.equal((await update)[0].pendientes, 1);
  await b.timeout(2000).emitWithAck('siguiente-ticket');
  update = once(b, 'estado-actual');
  const results = await Promise.all([
    a.timeout(2000).emitWithAck('atender-ticket', { escritorio: '1' }),
    b.timeout(2000).emitWithAck('atender-ticket', { escritorio: '2' })
  ]);
  assert.deepEqual(results.map(r => r.ticket.numero).sort(), [1, 2]);
  await update;
  const empty = await a.timeout(2000).emitWithAck('atender-ticket', { escritorio: '1' });
  assert.equal(empty.ok, false);
  assert.match(empty.msg, /pendientes/);
  const c = await client();
  const state = once(c, 'estado-actual');
  c.emit('consultar-estado');
  assert.equal((await state)[0].pendientes, 0);
});

test('rechaza mensajes malformados y no ejecuta órdenes sin confirmación', { timeout: 5000 }, async t => {
  const { client, queue } = await setup(t);
  const c = await client();
  for (const payload of [null, {}, { escritorio: [] }, { escritorio: '' }]) {
    const result = await c.timeout(2000).emitWithAck('atender-ticket', payload);
    assert.equal(result.ok, false);
  }
  c.emit('siguiente-ticket');
  c.emit('atender-ticket', null);
  // El siguiente mensaje confirmado garantiza que se procesaron los anteriores.
  const result = await c.timeout(2000).emitWithAck('siguiente-ticket');
  assert.equal(result.ticket.numero, 1);
  assert.equal(queue.snapshot().pendientes, 1);
});
