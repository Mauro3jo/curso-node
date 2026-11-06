import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { text, email, password, fail } from './validation.js';

export function userRoutes({ User }) {
  const routes = Router();
  routes.post('/usuarios', async (req, res) => {
    if (req.body?.rol !== undefined || req.body?.estado !== undefined || req.body?.google !== undefined) fail(400, 'No se pueden asignar roles o estados al registrarse');
    const nombre = text(req.body?.nombre, 'Nombre');
    const correo = email(req.body?.correo);
    const hash = await bcrypt.hash(password(req.body?.password), 12);
    const usuario = await User.create({ nombre, correo, password: hash });
    res.status(201).json({ usuario });
  });
  return routes;
}
