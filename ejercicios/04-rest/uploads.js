import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fail, id } from './validation.js';

function extension(buffer, mime) {
  if (mime === 'image/png' && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (mime === 'image/jpeg' && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (mime === 'image/gif' && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString())) return 'gif';
  if (mime === 'image/webp' && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'webp';
  fail(400, 'El archivo debe ser una imagen PNG, JPEG, GIF o WebP');
}

export function cloudinaryStorage(client) {
  return {
    async save(buffer) {
      const result = await new Promise((resolveResult, reject) => client.uploader.upload_stream({ folder: 'curso-node', resource_type: 'image' }, (error, result) => error ? reject(error) : resolveResult(result)).end(buffer));
      return { img: result.secure_url, publicId: result.public_id, provider: 'cloudinary' };
    },
    async remove(publicId) { if (publicId) await client.uploader.destroy(publicId); }
  };
}

export function uploadRoutes({ User, Product }, auth, { directory = resolve('data/uploads'), cloud } = {}) {
  const routes = Router();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 } }).single('archivo');
  async function find(req, _res, next) {
    const Model = { usuarios: User, productos: Product }[req.params.coleccion];
    if (!Model) fail(400, 'Colección inválida');
    req.imageModel = await Model.findOne({ _id: id(req.params.id), estado: true }).select('+imgPublicId');
    if (!req.imageModel) fail(404, 'Registro no encontrado');
    next();
  }
  routes.put('/uploads/:coleccion/:id', auth.authenticate, find, (req, res, next) => {
    const owner = req.params.coleccion === 'usuarios' ? req.imageModel._id : req.imageModel.usuario;
    if (req.user.rol !== 'ADMIN_ROLE' && String(req.user._id) !== String(owner)) fail(403, 'No podés cambiar esta imagen');
    upload(req, res, error => {
      if (error) return next(Object.assign(error, { status: error.code === 'LIMIT_FILE_SIZE' ? 413 : 400 }));
      next();
    });
  }, async (req, res) => {
    if (!req.file) fail(400, 'Enviá un archivo en el campo archivo');
    const ext = extension(req.file.buffer, req.file.mimetype);
    const row = req.imageModel;
    const previous = { img: row.img, publicId: row.imgPublicId, provider: row.imgProvider };
    let saved;
    if (cloud) saved = await cloud.save(req.file.buffer);
    else {
      const folder = join(directory, req.params.coleccion);
      await mkdir(folder, { recursive: true });
      const img = `${randomUUID()}.${ext}`;
      await writeFile(join(folder, img), req.file.buffer, { flag: 'wx' });
      saved = { img, provider: 'local' };
    }
    async function remove(image) {
      if (image.provider === 'cloudinary') {
        if (cloud) await cloud.remove(image.publicId);
      } else if (image.img && /^[a-f\d-]{36}\.(png|jpg|gif|webp)$/.test(image.img)) {
        await unlink(join(directory, req.params.coleccion, image.img)).catch(error => { if (error.code !== 'ENOENT') throw error; });
      }
    }
    row.img = saved.img;
    row.imgPublicId = saved.publicId;
    row.imgProvider = saved.provider;
    try { await row.save(); }
    catch (error) { await remove(saved).catch(() => {}); throw error; }
    await remove(previous).catch(() => console.error('No se pudo limpiar una imagen anterior'));
    res.json({ imagen: row.img });
  });
  routes.get('/uploads/:coleccion/:id', find, (req, res) => {
    const row = req.imageModel;
    res.set('X-Content-Type-Options', 'nosniff');
    if (row.imgProvider === 'cloudinary' && row.img?.startsWith('https://res.cloudinary.com/')) return res.redirect(row.img);
    if (!row.img || !/^[a-f\d-]{36}\.(png|jpg|gif|webp)$/.test(row.img)) fail(404, 'No hay imagen');
    res.sendFile(resolve(directory, req.params.coleccion, row.img));
  });
  return routes;
}
