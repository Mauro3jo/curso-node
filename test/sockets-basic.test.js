import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { io } from 'socket.io-client';
import { createBasicServer } from '../ejercicios/05-sockets/server.js';

test('sockets básicos validan mensajes y difunden el resultado confirmado', { timeout: 5000 }, async t => {
  const app = createBasicServer();
  const clients = [];
  t.after(async () => { clients.forEach(c => c.disconnect()); await new Promise(resolve => app.io.close(resolve)); });
  app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
  const url = `http://127.0.0.1:${app.server.address().port}`;
  for (let i = 0; i < 2; i++) { const c = io(url); clients.push(c); await once(c, 'connect'); }
  const [a, b] = clients;
  assert.equal((await a.timeout(1000).emitWithAck('enviar-mensaje', { mensaje: ' ' })).ok, false);
  const incoming = once(b, 'enviar-mensaje');
  const reply = await a.timeout(1000).emitWithAck('enviar-mensaje', { mensaje: 'Hola', id: 'identidad-falsa' });
  assert.equal(reply.ok, true);
  const [message] = await incoming;
  assert.equal(message.mensaje, 'Hola');
  assert.equal(message.id, a.id);
  assert.deepEqual(message, reply.mensaje);
  assert.equal((await fetch(url)).status, 200);
});
