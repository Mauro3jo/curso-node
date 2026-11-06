import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { attachChat } from './chat.js';

export function createChatServer() {
  const app = express();
  const server = createServer(app);
  const io = new Server(server, { maxHttpBufferSize: 8192, allowRequest: (req, done) => done(null, !req.headers.origin || req.headers.origin === `http://${req.headers.host}`) });
  app.use(express.static(fileURLToPath(new URL('public/', import.meta.url))));
  attachChat(io);
  return { server, io };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { server, io } = createChatServer();
  server.listen(Number(process.env.PORT || 3003), '127.0.0.1', () => console.log('Chat: http://127.0.0.1:' + server.address().port));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => io.close());
}
