import express, { type ErrorRequestHandler } from 'express';
import { DataTypes, Model, Sequelize, UniqueConstraintError, ValidationError, type Optional } from 'sequelize';

interface UserAttributes { id: number; nombre: string; email: string; estado: boolean; }
type UserInstance = Model<UserAttributes, Optional<UserAttributes, 'id' | 'estado'>>;

export function defineUser(db: Sequelize) {
  return db.define<UserInstance>('Usuario', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false, validate: { len: [1, 100] } },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
    estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, { timestamps: false });
}

function bad(message: string): never { throw Object.assign(new Error(message), { status: 400 }); }
function parseId(value: unknown): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) bad('ID inválido');
  return Number(value);
}
function fields(body: Record<string, unknown> | undefined, creating: boolean) {
  const result: Partial<Pick<UserAttributes, 'nombre' | 'email'>> = {};
  if (creating || body?.nombre !== undefined) {
    if (typeof body?.nombre !== 'string' || !body.nombre.trim() || body.nombre.trim().length > 100) bad('Nombre inválido');
    result.nombre = body.nombre.trim();
  }
  if (creating || body?.email !== undefined) {
    if (typeof body?.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) bad('Email inválido');
    result.email = body.email.trim().toLowerCase();
  }
  return result;
}

export function createSqlApp(User: ReturnType<typeof defineUser>) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/usuarios', async (_req, res) => res.json({ usuarios: await User.findAll({ where: { estado: true }, limit: 100, order: [['id', 'ASC']] }) }));
  app.get('/api/usuarios/:id', async (req, res) => {
    const usuario = await User.findOne({ where: { id: parseId(req.params.id), estado: true } });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    return res.json({ usuario });
  });
  app.post('/api/usuarios', async (req, res) => {
    const values = fields(req.body, true);
    const usuario = await User.create({ nombre: values.nombre!, email: values.email!, estado: true });
    res.status(201).json({ usuario });
  });
  app.put('/api/usuarios/:id', async (req, res) => {
    const usuario = await User.findOne({ where: { id: parseId(req.params.id), estado: true } });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    await usuario.update(fields(req.body, false));
    return res.json({ usuario });
  });
  app.delete('/api/usuarios/:id', async (req, res) => {
    const usuario = await User.findOne({ where: { id: parseId(req.params.id), estado: true } });
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
    await usuario.update({ estado: false });
    return res.json({ usuario });
  });
  app.use((_req, res) => res.status(404).json({ msg: 'Ruta no encontrada' }));
  const errorHandler: ErrorRequestHandler = (error: Error & { status?: number }, _req, res, _next) => {
    const status = error instanceof UniqueConstraintError ? 409 : error instanceof ValidationError ? 400 : error.status || 500;
    res.status(status).json({ msg: status === 409 ? 'El email ya existe' : status >= 500 ? 'Error de base de datos' : error.message });
  };
  app.use(errorHandler);
  return app;
}
