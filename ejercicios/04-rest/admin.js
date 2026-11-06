import '../../lib/env.js';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './database.js';
import { createModels } from './models.js';
import { email, password } from './validation.js';

const correo = email(process.env.REST_ADMIN_EMAIL);
const hash = await bcrypt.hash(password(process.env.REST_ADMIN_PASSWORD), 12);
const connection = await connectDatabase(process.env.MONGODB_URI);
try {
  const { User } = createModels(connection);
  await User.init();
  await User.create({ nombre: 'Administrador', correo, password: hash, rol: 'ADMIN_ROLE' });
  console.log('Administrador nuevo creado.');
} finally { await connection.close(); }
