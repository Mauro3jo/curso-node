import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { text, email, password, fail, id } from './validation.js';

export function userRoutes({ User }, auth) {
  const routes = Router();
  routes.post('/usuarios', async (req, res) => {
    if (req.body?.rol !== undefined || req.body?.estado !== undefined || req.body?.google !== undefined) fail(400, 'No se pueden asignar roles o estados al registrarse');
    const nombre = text(req.body?.nombre, 'Nombre');
    const correo = email(req.body?.correo);
    const hash = await bcrypt.hash(password(req.body?.password), 12);
    const usuario = await User.create({ nombre, correo, password: hash });
    res.status(201).json({ usuario });
  });
  if (auth) {
    routes.get('/usuarios', auth.authenticate, auth.admin, async (_req, res) => res.json({ usuarios: await User.find({ estado: true }).limit(100) }));
    routes.put('/usuarios/:id', auth.authenticate, async (req, res) => {
      const uid = id(req.params.id);
      const isAdmin = req.user.rol === 'ADMIN_ROLE';
      if (!isAdmin && String(req.user._id) !== uid) fail(403, 'No podés modificar otro usuario');
      if (req.body?.rol !== undefined && !isAdmin) fail(403, 'Solo un administrador puede cambiar roles');
      const updates = {};
      if (req.body?.nombre !== undefined) updates.nombre = text(req.body.nombre, 'Nombre');
      if (req.body?.correo !== undefined) updates.correo = email(req.body.correo);
      if (req.body?.password !== undefined) updates.password = await bcrypt.hash(password(req.body.password), 12);
      if (req.body?.rol !== undefined) {
        if (!['USER_ROLE', 'ADMIN_ROLE'].includes(req.body.rol)) fail(400, 'Rol inválido');
        updates.rol = req.body.rol;
      }
      const usuario = await User.findOneAndUpdate({ _id: uid, estado: true }, updates, { returnDocument: 'after', runValidators: true });
      if (!usuario) fail(404, 'Usuario no encontrado');
      res.json({ usuario });
    });
    routes.delete('/usuarios/:id', auth.authenticate, auth.admin, async (req, res) => {
      const usuario = await User.findOneAndUpdate({ _id: id(req.params.id), estado: true }, { estado: false }, { returnDocument: 'after' });
      if (!usuario) fail(404, 'Usuario no encontrado');
      res.json({ usuario });
    });
  }
  return routes;
}
