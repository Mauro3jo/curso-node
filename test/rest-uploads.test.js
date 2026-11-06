import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mongoDatabase } from '../test-support/mongo.js';
import { createModels } from '../ejercicios/04-rest/models.js';
import { createAuth } from '../ejercicios/04-rest/auth.js';
import { uploadRoutes, cloudinaryStorage } from '../ejercicios/04-rest/uploads.js';
import { createRestApp } from '../ejercicios/04-rest/app.js';

test('la subida local exige permisos y valida contenido y tamaño', { timeout: 60000 }, async t => {
  const dir = mkdtempSync(join(tmpdir(), 'node-uploads-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const models = createModels(await mongoDatabase(t));
  const user = await models.User.create({ nombre: 'Prueba', correo: 'img@example.test', password: 'fixture' });
  const other = await models.User.create({ nombre: 'Otro', correo: 'otro@example.test', password: 'fixture' });
  const auth = createAuth(models, randomBytes(32).toString('hex'));
  const server = createRestApp({ routes: uploadRoutes(models, auth, { directory: dir }) }).listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/uploads/usuarios/${user.id}`;
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5VQAAAAASUVORK5CYII=', 'base64');
  async function upload(bytes, token = auth.issue(user), name = 'test.png', type = 'image/png') {
    const form = new FormData(); form.append('archivo', new Blob([bytes], { type }), name);
    return fetch(url, { method: 'PUT', body: form, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  }
  assert.equal((await upload(png, '')).status, 401);
  assert.equal((await upload(png, auth.issue(other))).status, 403);
  assert.equal((await upload(Buffer.from('<script>bad</script>'))).status, 400);
  assert.equal((await upload(Buffer.alloc(2100000))).status, 413);
  assert.equal((await upload(png)).status, 200);
  const image = await fetch(url);
  assert.equal(image.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
});

test('Cloudinary transmite el buffer y conserva la identidad del recurso para reemplazarlo', async () => {
  let sent, removed;
  const storage = cloudinaryStorage({ uploader: {
    upload_stream(options, callback) {
      assert.equal(options.folder, 'curso-node');
      return { end(buffer) { sent = buffer; callback(null, { secure_url: 'https://res.cloudinary.com/demo/image/upload/test.png', public_id: 'curso-node/test' }); } };
    },
    async destroy(id) { removed = id; }
  } });
  const saved = await storage.save(Buffer.from('image'));
  assert.equal(sent.toString(), 'image');
  assert.equal(saved.publicId, 'curso-node/test');
  await storage.remove(saved.publicId);
  assert.equal(removed, 'curso-node/test');
});
