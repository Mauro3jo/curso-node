import express from 'express';
import { createServer as createHttpServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { Queue } from './queue.js';

const root = fileURLToPath(new URL('../', import.meta.url));

export function createServer({ dataFile = resolve(root, 'data/queue.json') } = {}) {
  const queue = new Queue(dataFile);
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.set('Content-Security-Policy', "default-src 'self'; connect-src 'self' ws: wss:; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'");
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use(express.static(resolve(root, 'public')));
  const server = createHttpServer(app);
  const io = new Server(server, {
    maxHttpBufferSize: 4096,
    allowRequest: (req, done) => done(null, !req.headers.origin || req.headers.origin === `http://${req.headers.host}`)
  });

  const broadcast = () => io.emit('estado-actual', queue.snapshot());
  io.on('connection', socket => {
    socket.emit('estado-actual', queue.snapshot());
    socket.on('consultar-estado', () => socket.emit('estado-actual', queue.snapshot()));
    socket.on('siguiente-ticket', ack => {
      if (typeof ack !== 'function') return;
      try {
        const ticket = queue.next();
        broadcast();
        ack({ ok: true, ticket });
      } catch (error) {
        console.error('No se pudo guardar el turno:', error.message);
        ack({ ok: false, msg: 'No se pudo guardar el turno. Revisá el servidor.' });
      }
    });
    socket.on('atender-ticket', (payload, ack) => {
      if (typeof ack !== 'function') return;
      const desk = payload?.escritorio;
      if (typeof desk !== 'string' || !desk.trim() || desk.trim().length > 40) {
        return ack({ ok: false, msg: 'Ingresá un escritorio de 1 a 40 caracteres.' });
      }
      try {
        const ticket = queue.attend(desk);
        broadcast();
        ack(ticket ? { ok: true, ticket } : { ok: false, msg: 'No hay turnos pendientes.' });
      } catch (error) {
        console.error('No se pudo guardar la atención:', error.message);
        ack({ ok: false, msg: 'No se pudo guardar la atención. Revisá el servidor.' });
      }
    });
  });
  // Actualiza también las pantallas que siguen abiertas al cambiar el día.
  const timer = setInterval(() => {
    try { broadcast(); } catch (error) { console.error('No se pudo actualizar la cola:', error.message); }
  }, 30000);
  timer.unref();
  server.on('close', () => clearInterval(timer));
  return { app, server, io, queue };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT debe ser un puerto entre 1 y 65535');
  const { server, io } = createServer({ dataFile: process.env.DATA_FILE });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Turnos: http://127.0.0.1:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => io.close());
}
