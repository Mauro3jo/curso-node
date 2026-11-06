import { MongoMemoryServer } from 'mongodb-memory-server';
import { resolve } from 'node:path';
import { connectDatabase } from '../ejercicios/04-rest/database.js';

export async function mongoDatabase(t) {
  const mongo = await MongoMemoryServer.create({ binary: { downloadDir: resolve('data/mongodb-binaries') } });
  let connection;
  t.after(async () => { await connection?.close(); await mongo.stop(); });
  connection = await connectDatabase(mongo.getUri('curso_node_test'));
  return connection;
}

export async function serve(t, app) {
  const server = app.listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return async (path, { method = 'GET', body, token } = {}) => {
    const response = await fetch(base + path, { method, headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` })
    }, ...(body !== undefined && { body: JSON.stringify(body) }) });
    return { status: response.status, data: await response.json() };
  };
}
