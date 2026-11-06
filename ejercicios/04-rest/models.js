import { Schema } from 'mongoose';

export function createModels(connection) {
  const schema = new Schema({
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: { type: String, enum: ['USER_ROLE', 'ADMIN_ROLE'], default: 'USER_ROLE' },
    estado: { type: Boolean, default: true },
    google: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    img: String
  }, { toJSON: { transform(_doc, ret) { ret.uid = String(ret._id); delete ret.password; delete ret.googleId; delete ret._id; delete ret.__v; return ret; } } });
  const category = new Schema({
    nombre: { type: String, required: true, unique: true, uppercase: true, trim: true },
    estado: { type: Boolean, default: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
  });
  const product = new Schema({
    nombre: { type: String, required: true, unique: true, uppercase: true, trim: true },
    precio: { type: Number, default: 0, min: 0 },
    descripcion: { type: String, maxlength: 1000, default: '' },
    disponible: { type: Boolean, default: true },
    categoria: { type: Schema.Types.ObjectId, ref: 'Categoria', required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    estado: { type: Boolean, default: true },
    img: String
  });
  return {
    User: connection.models.Usuario || connection.model('Usuario', schema),
    Category: connection.models.Categoria || connection.model('Categoria', category),
    Product: connection.models.Producto || connection.model('Producto', product)
  };
}
