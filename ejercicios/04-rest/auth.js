import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fail, email } from './validation.js';

export function createAuth({ User }, secret) {
  if (typeof secret !== 'string' || Buffer.byteLength(secret) < 32) throw new Error('JWT_SECRET debe tener al menos 32 bytes');
  const options = { issuer: 'curso-node', audience: 'curso-node-api' };
  const issue = user => jwt.sign({}, secret, { ...options, subject: String(user._id), expiresIn: '2h', algorithm: 'HS256' });
  async function readToken(token) {
    try {
      if (typeof token !== 'string') fail(401, 'Token inválido');
      const data = jwt.verify(token, secret, { ...options, algorithms: ['HS256'] });
      const user = await User.findOne({ _id: data.sub, estado: true });
      if (!user) fail(401, 'Sesión inválida');
      return user;
    } catch { fail(401, 'Token inválido o sesión desactivada'); }
  }
  async function authenticate(req, _res, next) {
    const authorization = req.get('authorization');
    if (!authorization?.startsWith('Bearer ')) fail(401, 'Se necesita un token Bearer');
    req.user = await readToken(authorization.slice(7));
    next();
  }
  function admin(req, _res, next) {
    if (req.user?.rol !== 'ADMIN_ROLE') fail(403, 'Se necesita el rol administrador');
    next();
  }
  const routes = Router();
  routes.post('/auth/login', async (req, res) => {
    const correo = email(req.body?.correo);
    if (typeof req.body?.password !== 'string') fail(400, 'Ingresá una contraseña');
    const user = await User.findOne({ correo, estado: true }).select('+password');
    if (!user || user.google || !await bcrypt.compare(req.body.password, user.password)) fail(401, 'Credenciales inválidas');
    res.json({ usuario: user, token: issue(user) });
  });
  routes.get('/auth', authenticate, (req, res) => res.json({ usuario: req.user }));
  return { routes, authenticate, admin, issue, readToken };
}
