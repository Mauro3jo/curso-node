# Materiales y avance

Inventario de los archivos locales revisados. No equivale al temario completo de Udemy: el navegador bloqueó esa consulta y no se intentó eludir la restricción. Las fechas de Git corresponden al trabajo actual.

| Bloque identificable | Material local | Estado |
| --- | --- | --- |
| Saludos, funciones y event loop | `node-hola-mundo-0.1.0.zip` | Implementado y probado |
| Callbacks, promesas y async/await | Enlace a `Klerith/node-blocking-vs-non-blocking` proporcionado con el material | Ejemplo propio implementado y probado; sin asumir reproducción exacta |
| Argumentos y escritura de archivos | Referencia a yargs proporcionada con el material | CLI de tablas implementado y probado; no había ZIP del original |
| Menú, tareas, UUID y persistencia JSON | `node-console-app-todo-0.5.0.zip` | Implementado y probado |
| Ciudad, coordenadas, clima e historial | `node-clima-app-main.zip` | Implementado y probado con respuestas controladas; falta consulta real con claves propias |
| Express, rutas HTTP y estáticos | `curso-node-restserver-1.0.0.zip` | Servidor JSON, salud y errores HTTP probados; estáticos cubiertos en turnos |
| MongoDB, usuarios, validación y contraseñas | `curso-node-restserver-2.1.0.zip` | Registro, unicidad y bcrypt probados contra MongoDB temporal |
| Login, JWT y roles | `curso-node-restserver-2.2.0.zip` | Implementado y probado: tokens, permisos, edición y baja lógica |
| Categorías, productos y búsquedas | `curso-node-restserver-4.0.0.zip` | Implementado y probado contra MongoDB temporal |
| Inicio de sesión con Google | `curso-node-restserver-4.0.0.zip` | Adaptador implementado y probado con respuestas controladas; falta login real con cliente propio |
| Archivos locales e imágenes Cloudinary | `curso-node-restserver-5.0.0.zip` | Subida local probada; adaptador Cloudinary probado con proveedor controlado, falta servicio real |
| Eventos, emisión y confirmaciones Socket.IO | `curso-node-socket-server-basico-main.zip` | Demostración independiente implementada y probada |
| Cola, escritorios y pantalla pública | `node-curso-socket-colas-main.zip`, `Seccion-15.zip` | Implementado y probado |
| Chat con salas, usuarios y mensajes privados | `socket-chat-1.0.0.zip` | Implementado y probado con múltiples clientes |
| Chat autenticado, usuarios activos y últimos mensajes | `curso-node-socket-chat-main.zip` | Implementado y probado con JWT, identidad de MongoDB y revocación |
| TypeScript, Sequelize, MySQL y CRUD de usuarios | `ts-rest-server-main.zip` | Compilación estricta y CRUD probados contra MariaDB temporal aislado |
| Plantillas de interfaz | `HTML-Chat.zip`, `templated-roadtrip.zip` | Recursos de referencia; no se atribuyen como implementación propia |
| Express, plantillas y parciales | Referencias a `hbs` y Handlebars proporcionadas junto al material | Catálogo propio implementado y probado con Handlebars directo; sin despliegue externo |
| Builds estáticos de Angular/React | `Angular-React-Prod-Builds.zip` | Material compilado para servir; no hay proyecto fuente que reconstruir desde este ZIP |
| Códigos HTTP, imágenes y utilidad de scroll | PDF, JPG y `scrollBottom.js` | Referencias y recursos auxiliares |
| Lectura de payload JWT e instalaciones | Gists `44ee5349fa13699d9c5f1e82b3be040e` y `177c153db77e566cb763f79e65d248bf` | Revisados; la autenticación verifica firma, audiencia y expiración con JWT, no usa la decodificación del navegador como permiso |
| Certificado | `UC-cd139af3-7c52-4254-b26a-4b4e41c221a7.pdf` | Revisado visualmente y publicado sin modificaciones en `certificado/node-udemy.pdf`, con autorización específica del titular |

## Plan de ejecución

Cada fila funcional se desarrolla con pruebas antes de confirmar el cambio. La API avanza en etapas que siguen las versiones del material: servidor HTTP, persistencia de usuarios, autenticación, catálogo, proveedor Google y archivos. El chat se separa en salas y autenticación. TypeScript conserva Sequelize y MySQL.

Los tests usan archivos y bases de prueba aislados. Las claves locales del profesor o de otras aplicaciones no se copian ni se utilizan. Las integraciones externas sin credenciales se prueban con respuestas controladas y se identifican como pendientes de una prueba real.

No se crean commits vacíos, fechas retroactivas ni fragmentos artificiales para aumentar el contador. Se publica cada avance coherente cuando pasa su verificación.
