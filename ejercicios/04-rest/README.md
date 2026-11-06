# API de usuarios y catálogo

Registro, login con JWT, roles, categorías, productos, búsqueda e imágenes con Express y MongoDB.

Desde la raíz: `npm run rest -- --demo` levanta una base MongoDB temporal en `http://127.0.0.1:3001`. La primera ejecución descarga el servidor desde la distribución oficial de MongoDB. Los datos de este modo desaparecen al cerrar.

Para guardar datos, usá una base de práctica propia y configurá `MONGODB_URI` y `JWT_SECRET` (al menos 32 bytes aleatorios). Después ejecutá `npm run rest`. Podés usar variables de entorno o un `.env` local, que Git ignora. `PORT` cambia el puerto.

| Ruta | Uso |
| --- | --- |
| `POST /api/usuarios` | Registro con `nombre`, `correo` y `password` |
| `POST /api/auth/login` | Login con `correo` y `password`; devuelve `token` |
| `GET /api/auth` | Consultar la sesión |
| `GET /api/usuarios` | Listar usuarios; administrador |
| `PUT /api/usuarios/:id` | Editar el usuario propio; administrador para otros usuarios o roles |
| `DELETE /api/usuarios/:id` | Baja lógica; administrador |
| `GET /api/categorias`, `GET /api/productos` | Listas con `desde` y `limite` |
| `GET /api/categorias/:id`, `GET /api/productos/:id` | Consultar un registro activo |
| `POST /api/categorias` | Crear con `nombre` |
| `POST /api/productos` | Crear con `nombre`, `categoria`, `precio`, `descripcion` y `disponible` |
| `PUT /api/categorias/:id`, `PUT /api/productos/:id` | Editar como creador o administrador |
| `DELETE /api/categorias/:id`, `DELETE /api/productos/:id` | Baja lógica; administrador |
| `GET /api/buscar/:coleccion/:termino` | Búsqueda literal en categorías/productos; usuarios solo para administrador |
| `PUT /api/uploads/:coleccion/:id` | Imagen de usuario/producto propio; campo multipart `archivo`, máximo 2 MiB |
| `GET /api/uploads/:coleccion/:id` | Obtener la imagen |
| `POST /api/auth/google` | Login con `id_token`; necesita `GOOGLE_CLIENT_ID` |

En las rutas privadas enviá `Authorization: Bearer <token>`. Los registros normales siempre tienen rol de usuario. Para crear un administrador nuevo en tu base de práctica, configurá `REST_ADMIN_EMAIL`, `REST_ADMIN_PASSWORD` y ejecutá `npm run rest:admin`.

Las imágenes se guardan localmente en `data/uploads`. Si configurás `CLOUDINARY_URL`, las nuevas imágenes se envían a tu cuenta de Cloudinary. No se vinculan automáticamente cuentas locales con Google por compartir correo.

Las pruebas usan un MongoDB real temporal. Google y Cloudinary se comprueban con proveedores controlados; falta comprobarlos con una cuenta y credenciales propias. Es una aplicación local de práctica, sin despliegue público ni controles operativos para producción.

Referencia: versiones 1.0.0 a 5.0.0 de `curso-node-restserver` de Fernando Herrera. Se conserva la funcionalidad de los ejemplos, con validación y permisos agregados en los puntos donde el material los omitía.
