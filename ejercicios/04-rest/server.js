import '../../lib/env.js';
import { createRestApp } from './app.js';
import { connectDatabase } from './database.js';
import { createModels } from './models.js';
import { userRoutes } from './users.js';
import { resolve } from 'node:path';

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto inválido');
let demo;
let uri = process.env.MONGODB_URI;
if (process.argv.includes('--demo')) {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  demo = await MongoMemoryServer.create({ binary: { downloadDir: resolve('data/mongodb-binaries') } });
  uri = demo.getUri('curso_node_demo');
  console.log('DEMOSTRACIÓN: base MongoDB temporal, se borra al cerrar.');
}
const connection = await connectDatabase(uri);
const models = createModels(connection);
await models.User.init();
const server = createRestApp({ routes: userRoutes(models) }).listen(port, '127.0.0.1', () => console.log(`API: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await connection.close(); await demo?.stop(); }));
