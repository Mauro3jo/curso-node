import { Sequelize } from 'sequelize';
import { createSqlApp, defineUser } from './app.js';

try { process.loadEnvFile(process.env.ENV_FILE || '.env'); }
catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
if (!process.env.MYSQL_URL) throw new Error('Configurá MYSQL_URL con una base de práctica propia');
const db = new Sequelize(process.env.MYSQL_URL, { logging: false });
const User = defineUser(db);
await db.authenticate();
await db.sync();
const port = Number(process.env.PORT || 3004);
const server = createSqlApp(User).listen(port, '127.0.0.1', () => console.log(`Usuarios SQL: http://127.0.0.1:${port}`));
server.on('error', async error => { console.error(error.message); await db.close(); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await db.close(); }));
