import express from 'express';
import Handlebars from 'handlebars';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export function createWebApp() {
  const app = express();
  app.disable('x-powered-by');
  const engine = Handlebars.create();
  engine.registerPartial('footer', readFileSync(fileURLToPath(new URL('views/partials/footer.hbs', import.meta.url)), 'utf8'));
  app.engine('hbs', (path, options, callback) => {
    readFile(path, 'utf8').then(template => callback(null, engine.compile(template)(options))).catch(callback);
  });
  app.set('view engine', 'hbs');
  app.set('views', fileURLToPath(new URL('views/', import.meta.url)));
  app.use(express.static(fileURLToPath(new URL('public/', import.meta.url))));
  app.get('/', (req, res) => {
    const nombre = typeof req.query.nombre === 'string' ? req.query.nombre.trim().slice(0, 80) : 'Visitante';
    res.render('home', { titulo: 'Catálogo de bebidas', nombre, year: new Date().getFullYear(), productos: [
      { nombre: 'Café', precio: 1200 }, { nombre: 'Cortado', precio: 1500 }, { nombre: 'Té', precio: 1000 }
    ] });
  });
  app.use((_req, res) => res.status(404).render('not-found', { titulo: 'Página no encontrada', year: new Date().getFullYear() }));
  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createWebApp().listen(Number(process.env.PORT || 3005), '127.0.0.1', () => console.log('Web: http://127.0.0.1:' + server.address().port));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
}
