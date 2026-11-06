import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { mongoDatabase, serve } from '../test-support/mongo.js';
import { createModels } from '../ejercicios/04-rest/models.js';
import { userRoutes } from '../ejercicios/04-rest/users.js';
import { createRestApp } from '../ejercicios/04-rest/app.js';

test('registra usuarios en MongoDB con validación, unicidad y hash', { timeout: 180000 }, async t => {
  const connection = await mongoDatabase(t);
  const models = createModels(connection);
  await models.User.init();
  const request = await serve(t, createRestApp({ routes: userRoutes(models) }));
  const input = { nombre: 'Mauro', correo: 'mauro@example.test', password: 'solo-pruebas-123' };
  const invalid = await request('/api/usuarios', { method: 'POST', body: { ...input, correo: 'no-email' } });
  assert.equal(invalid.status, 400);
  const deniedRole = await request('/api/usuarios', { method: 'POST', body: { ...input, rol: 'ADMIN_ROLE' } });
  assert.equal(deniedRole.status, 400);
  const created = await request('/api/usuarios', { method: 'POST', body: input });
  assert.equal(created.status, 201);
  assert.equal(created.data.usuario.rol, 'USER_ROLE');
  assert.equal('password' in created.data.usuario, false);
  const stored = await models.User.findOne({ correo: input.correo }).select('+password');
  assert.notEqual(stored.password, input.password);
  assert.equal(await bcrypt.compare(input.password, stored.password), true);
  assert.equal((await request('/api/usuarios', { method: 'POST', body: input })).status, 409);
  assert.equal(await models.User.countDocuments(), 1);
});
