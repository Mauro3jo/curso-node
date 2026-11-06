import mysql from 'mysql2/promise';

if (!process.env.MYSQL_TEST_URL) throw new Error('MYSQL_TEST_URL no está configurada');
const url = new URL(process.env.MYSQL_TEST_URL);
if (url.hostname !== '127.0.0.1' || url.pathname !== '/curso_node_test') throw new Error('El iniciador solo acepta la base temporal curso_node_test en loopback');
url.pathname = '/';
let ready = false;
for (let attempt = 0; attempt < 80; attempt++) {
  let connection;
  try {
    connection = await mysql.createConnection(url.href);
    await connection.query('CREATE DATABASE curso_node_test CHARACTER SET utf8mb4');
    ready = true; break;
  } catch (error) {
    if (!['ECONNREFUSED', 'ECONNRESET', 'PROTOCOL_CONNECTION_LOST'].includes(error.code)) throw new Error('No se pudo preparar la base SQL de prueba');
    await new Promise(resolve => setTimeout(resolve, 250));
  } finally { await connection?.end(); }
}
if (!ready) throw new Error('La instancia SQL temporal no respondió');
