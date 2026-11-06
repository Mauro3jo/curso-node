import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export function createBasicServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { maxHttpBufferSize: 4096, allowRequest: (req, done) => done(null, !req.headers.origin || req.headers.origin === `http://${req.headers.host}`) });
  app.get('/', (_req, res) => res.sendFile(fileURLToPath(new URL('index.html', import.meta.url))));
  app.get('/app.js', (_req, res) => res.sendFile(fileURLToPath(new URL('app.js', import.meta.url))));
  io.on('connection', socket => socket.on('enviar-mensaje', (payload, ack) => {
    if (typeof ack !== 'function') return;
    if (typeof payload?.mensaje !== 'string' || !payload.mensaje.trim() || payload.mensaje.length > 500) return ack({ ok: false, msg: 'Ingresá de 1 a 500 caracteres' });
    const message = { mensaje: payload.mensaje.trim(), id: socket.id, fecha: Date.now() };
    io.emit('enviar-mensaje', message);
    ack({ ok: true, mensaje: message });
  }));
  return { server, io };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { server, io } = createBasicServer();
  server.listen(Number(process.env.PORT || 3002), '127.0.0.1', () => console.log('Sockets: http://127.0.0.1:' + server.address().port));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => io.close());
}
