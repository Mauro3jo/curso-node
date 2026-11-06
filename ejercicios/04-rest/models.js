import { Schema } from 'mongoose';

export function createModels(connection) {
  const schema = new Schema({
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: { type: String, enum: ['USER_ROLE', 'ADMIN_ROLE'], default: 'USER_ROLE' },
    estado: { type: Boolean, default: true },
    google: { type: Boolean, default: false },
    img: String
  }, { toJSON: { transform(_doc, ret) { ret.uid = String(ret._id); delete ret.password; delete ret._id; delete ret.__v; return ret; } } });
  return { User: connection.models.Usuario || connection.model('Usuario', schema) };
}
