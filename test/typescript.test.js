import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Sequelize, Utils, DataTypes } from 'sequelize';
import { createSqlApp, defineUser } from '../ejercicios/07-typescript/dist/app.js';
import { serve } from '../test-support/mongo.js';

test('Sequelize mantiene compatibles los UUID tras corregir la dependencia transitiva', () => {
  for (const type of [DataTypes.UUIDV1, DataTypes.UUIDV4]) assert.match(Utils.toDefaultValue(type()), /^[a-f0-9-]{36}$/);
});

test('CRUD TypeScript contra MySQL: validación, duplicados y baja lógica', { skip: !process.env.MYSQL_TEST_URL, timeout: 30000 }, async t => {
  const db = new Sequelize(process.env.MYSQL_TEST_URL, { logging: false });
  t.after(() => db.close());
  const User = defineUser(db);
  // Este test requiere una base nueva de prueba; nunca ejecuta sync({force:true}).
  await db.sync();
  const request = await serve(t, createSqlApp(User));
  const correo = `prueba-${Date.now()}@example.test`;
  const bad = await request('/api/usuarios', { method: 'POST', body: { nombre: 'A', email: 'invalido' } });
  assert.equal(bad.status, 400);
  const created = await request('/api/usuarios', { method: 'POST', body: { nombre: 'Mauro', email: correo, estado: false } });
  assert.equal(created.status, 201);
  assert.equal(created.data.usuario.estado, true);
  const id = created.data.usuario.id;
  assert.equal((await request('/api/usuarios', { method: 'POST', body: { nombre: 'Otro', email: correo } })).status, 409);
  assert.equal((await request(`/api/usuarios/${id}`, { method: 'PUT', body: { nombre: 'Cambio', estado: false } })).data.usuario.nombre, 'Cambio');
  assert.equal((await request(`/api/usuarios/${id}`)).data.usuario.estado, true);
  assert.equal((await request('/api/usuarios/abc')).status, 400);
  assert.equal((await request(`/api/usuarios/${id}`, { method: 'DELETE' })).status, 200);
  assert.equal((await request(`/api/usuarios/${id}`)).status, 404);
  assert.equal((await request('/api/usuarios')).data.usuarios.some(u => u.id === id), false);
});
