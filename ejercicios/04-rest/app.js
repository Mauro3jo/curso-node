import express from 'express';

export function createRestApp({ routes, chatDirectory } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/', (_req, res) => res.type('text').send('API de usuarios y catálogo. Estado: /health'));
  if (routes) app.use('/api', routes);
  if (chatDirectory) {
    app.get('/chat/config', (_req, res) => res.json({ authenticated: true }));
    app.use('/chat', express.static(chatDirectory));
  }
  app.use((_req, res) => res.status(404).json({ msg: 'Ruta no encontrada' }));
  app.use((error, _req, res, _next) => {
    const status = error.status || (error.code === 11000 ? 409 : ['ValidationError', 'CastError'].includes(error.name) ? 400 : 500);
    const msg = error.type === 'entity.parse.failed' ? 'JSON inválido' : status === 409 ? 'El registro ya existe' : status >= 500 ? 'Error interno del servidor' : error.message;
    res.status(status).json({ msg });
  });
  return app;
}
