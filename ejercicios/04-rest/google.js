import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { email, text, fail } from './validation.js';

export function googleRoutes({ User }, auth, { clientId = process.env.GOOGLE_CLIENT_ID, client = new OAuth2Client() } = {}) {
  const routes = Router();
  routes.post('/auth/google', async (req, res) => {
    if (!clientId) fail(503, 'Google no está configurado');
    const idToken = text(req.body?.id_token, 'ID token', 10000);
    let payload;
    try { payload = (await client.verifyIdToken({ idToken, audience: clientId })).getPayload(); }
    catch { fail(401, 'Token de Google inválido'); }
    if (!payload?.email_verified || typeof payload.sub !== 'string' || !payload.sub) fail(401, 'Google no verificó la identidad o el correo');
    const correo = email(payload.email);
    let user = await User.findOne({ googleId: payload.sub });
    if (user && !user.estado) fail(401, 'Cuenta desactivada');
    if (!user) {
      if (await User.exists({ correo })) fail(409, 'Ese correo ya tiene una cuenta. No se vincula automáticamente con Google.');
      user = await User.create({ nombre: text(payload.name || correo, 'Nombre'), correo, google: true, googleId: payload.sub, password: await bcrypt.hash(randomBytes(32).toString('hex'), 12) });
    }
    res.json({ usuario: user, token: auth.issue(user) });
  });
  return routes;
}
