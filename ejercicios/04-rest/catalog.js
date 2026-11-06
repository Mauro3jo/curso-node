import { Router } from 'express';
import { fail, id, text } from './validation.js';

function page(value, fallback, max) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) > max) fail(400, 'Paginación inválida');
  return Number(value);
}

export function catalogRoutes({ User, Category, Product }, auth) {
  const routes = Router();
  for (const [collection, Model, singular] of [['categorias', Category, 'categoria'], ['productos', Product, 'producto']]) {
    const product = collection === 'productos';
    async function fields(body, creating) {
      const result = {};
      if (creating || body?.nombre !== undefined) result.nombre = text(body?.nombre, 'Nombre').toUpperCase();
      if (product) {
        if (creating || body?.categoria !== undefined) {
          result.categoria = id(body?.categoria);
          if (!await Category.exists({ _id: result.categoria, estado: true })) fail(404, 'Categoría no encontrada');
        }
        if (body?.precio !== undefined) {
          if (typeof body.precio !== 'number' || !Number.isFinite(body.precio) || body.precio < 0) fail(400, 'Precio inválido');
          result.precio = body.precio;
        }
        if (body?.descripcion !== undefined) {
          if (typeof body.descripcion !== 'string' || body.descripcion.length > 1000) fail(400, 'Descripción inválida');
          result.descripcion = body.descripcion.trim();
        }
        if (body?.disponible !== undefined) {
          if (typeof body.disponible !== 'boolean') fail(400, 'Disponible debe ser booleano');
          result.disponible = body.disponible;
        }
      }
      return result;
    }
    routes.get(`/${collection}`, async (req, res) => {
      const desde = page(req.query.desde, 0, 100000), limite = page(req.query.limite, 10, 100);
      if (limite === 0) fail(400, 'El límite debe ser mayor que cero');
      const [total, rows] = await Promise.all([Model.countDocuments({ estado: true }), Model.find({ estado: true }).sort({ _id: 1 }).skip(desde).limit(limite)]);
      res.json({ total, [collection]: rows });
    });
    routes.get(`/${collection}/:id`, async (req, res) => {
      const row = await Model.findOne({ _id: id(req.params.id), estado: true });
      if (!row) fail(404, 'Registro no encontrado');
      res.json({ [singular]: row });
    });
    routes.post(`/${collection}`, auth.authenticate, async (req, res) => {
      const row = await Model.create({ ...await fields(req.body, true), usuario: req.user._id });
      res.status(201).json({ [singular]: row });
    });
    routes.put(`/${collection}/:id`, auth.authenticate, async (req, res) => {
      const row = await Model.findOne({ _id: id(req.params.id), estado: true });
      if (!row) fail(404, 'Registro no encontrado');
      if (req.user.rol !== 'ADMIN_ROLE' && String(row.usuario) !== String(req.user._id)) fail(403, 'Solo el creador o un administrador pueden editar');
      Object.assign(row, await fields(req.body, false));
      await row.save();
      res.json({ [singular]: row });
    });
    routes.delete(`/${collection}/:id`, auth.authenticate, auth.admin, async (req, res) => {
      const row = await Model.findOne({ _id: id(req.params.id), estado: true });
      if (!row) fail(404, 'Registro no encontrado');
      if (!product && await Product.exists({ categoria: row._id, estado: true })) fail(409, 'La categoría todavía tiene productos activos');
      row.estado = false;
      await row.save();
      res.json({ [singular]: row });
    });
  }
  routes.get('/buscar/:coleccion/:termino', async (req, res, next) => {
    const collection = req.params.coleccion;
    const Model = { usuarios: User, categorias: Category, productos: Product }[collection];
    if (!Model) fail(400, 'Colección inválida');
    if (collection === 'usuarios') {
      await auth.authenticate(req, res, () => {});
      auth.admin(req, res, () => {});
    }
    const term = text(req.params.termino, 'Término', 100);
    const filter = { estado: true };
    if (/^[a-f\d]{24}$/i.test(term)) filter._id = term;
    else filter.nombre = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    res.json({ results: await Model.find(filter).limit(20) });
  });
  return routes;
}
