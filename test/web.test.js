import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWebApp } from '../ejercicios/08-web/server.js';

test('Express renderiza Handlebars, parciales y contenido escapado', async t => {
  const server = createWebApp().listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(url + '/?nombre=%3Cscript%3Eprueba%3C%2Fscript%3E');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /&lt;script&gt;prueba/);
  assert.doesNotMatch(html, /<script>prueba/);
  assert.match(html, /Catálogo de bebidas/);
  assert.match(html, /Cortado/);
  assert.match(html, new RegExp(String(new Date().getFullYear())));
  assert.equal((await fetch(url + '/style.css')).status, 200);
  assert.equal((await fetch(url + '/no-existe')).status, 404);
});
