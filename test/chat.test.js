import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { io as connect } from 'socket.io-client';
import { createChatServer } from '../ejercicios/06-chat/server.js';

test('chat separa salas, confirma privados y conserva los últimos diez mensajes', { timeout: 10000 }, async t => {
  const app = createChatServer(); const clients = [];
  t.after(async () => { clients.forEach(c => c.disconnect()); await new Promise(resolve => app.io.close(resolve)); });
  app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
  const url = `http://127.0.0.1:${app.server.address().port}`;
  assert.equal((await fetch(url)).status, 200);
  assert.equal((await fetch(url + '/app.js')).status, 200);
  async function client(name, room) {
    const c = connect(url); clients.push(c); await once(c, 'connect');
    if (name) assert.equal((await c.timeout(2000).emitWithAck('entrar-chat', { nombre: name, sala: room })).ok, true);
    return c;
  }
  const a = await client('Ana', 'node'), b = await client('Beto', 'node'), outsider = await client('Cora', 'otra');
  const messages = []; b.on('mensaje', data => messages.push(data));
  assert.equal((await a.timeout(2000).emitWithAck('enviar-mensaje', { mensaje: 'Hola', para: outsider.id })).ok, false);
  let received = once(b, 'mensaje');
  assert.equal((await a.timeout(2000).emitWithAck('enviar-mensaje', { mensaje: 'Privado', para: b.id })).ok, true);
  assert.equal((await received)[0].privado, true);
  await outsider.timeout(2000).emitWithAck('enviar-mensaje', { mensaje: 'No debe filtrarse' });
  received = once(b, 'mensaje');
  await a.timeout(2000).emitWithAck('enviar-mensaje', { mensaje: 'Público', nombre: 'Falso' });
  assert.equal((await received)[0].nombre, 'Ana');
  assert.equal(messages.some(m => m.mensaje === 'No debe filtrarse'), false);
  for (let i = 0; i < 12; i++) await a.timeout(2000).emitWithAck('enviar-mensaje', { mensaje: `Mensaje ${i}` });
  const c = connect(url); clients.push(c); await once(c, 'connect');
  const history = once(c, 'historial');
  await c.timeout(2000).emitWithAck('entrar-chat', { nombre: 'Dani', sala: 'node' });
  const [items] = await history;
  assert.equal(items.length, 10);
  assert.equal(items[0].mensaje, 'Mensaje 2');
  assert.equal(items.some(m => m.privado), false);
  const anonymous = await client();
  assert.equal((await anonymous.timeout(2000).emitWithAck('enviar-mensaje', { mensaje: 'sin entrar' })).ok, false);
  anonymous.disconnect();
  const updated = once(b, 'usuarios'); a.disconnect();
  assert.equal((await updated)[0].some(u => u.nombre === 'Ana'), false);
});
