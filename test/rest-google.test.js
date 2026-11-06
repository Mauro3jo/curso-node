import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mongoDatabase, serve } from '../test-support/mongo.js';
import { createModels } from '../ejercicios/04-rest/models.js';
import { createAuth } from '../ejercicios/04-rest/auth.js';
import { googleRoutes } from '../ejercicios/04-rest/google.js';
import { createRestApp } from '../ejercicios/04-rest/app.js';

test('Google exige audiencia y correo verificado y no vincula cuentas locales por correo', { timeout: 60000 }, async t => {
  const models = createModels(await mongoDatabase(t));
  await models.User.init();
  const auth = createAuth(models, randomBytes(32).toString('hex'));
  let payload = { sub: 'google-user-test', email: 'google@example.test', email_verified: true, name: 'Google Test' };
  const client = { async verifyIdToken(options) {
    assert.equal(options.audience, 'cliente-de-prueba');
    if (options.idToken === 'invalido') throw new Error('Firma inválida');
    return { getPayload: () => payload };
  } };
  const request = await serve(t, createRestApp({ routes: googleRoutes(models, auth, { clientId: 'cliente-de-prueba', client }) }));
  const login = token => request('/api/auth/google', { method: 'POST', body: { id_token: token } });
  assert.equal((await login('invalido')).status, 401);
  payload.email_verified = false;
  assert.equal((await login('prueba')).status, 401);
  payload.email_verified = true;
  const first = await login('prueba');
  assert.equal(first.status, 200);
  assert.equal(first.data.usuario.google, true);
  assert.equal('password' in first.data.usuario, false);
  assert.equal((await login('prueba')).data.usuario.uid, first.data.usuario.uid);
  await models.User.create({ nombre: 'Local', correo: 'local@example.test', password: 'fixture-local' });
  payload = { ...payload, sub: 'otro-google', email: 'local@example.test' };
  assert.equal((await login('prueba')).status, 409);
  assert.equal(await models.User.countDocuments(), 2);
});
