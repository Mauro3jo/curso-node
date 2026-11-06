# Materiales y avance

Inventario de los archivos locales revisados. No equivale al temario completo de Udemy: el navegador bloqueó esa consulta y no se intentó eludir la restricción. Las fechas de Git corresponden al trabajo actual.

| Bloque identificable | Material local | Estado |
| --- | --- | --- |
| Saludos, funciones y event loop | `node-hola-mundo-0.1.0.zip` | Implementado y probado |
| Menú, tareas, UUID y persistencia JSON | `node-console-app-todo-0.5.0.zip` | Implementado y probado |
| Ciudad, coordenadas, clima e historial | `node-clima-app-main.zip` | Implementado y probado con respuestas controladas; falta consulta real con claves propias |
| Express, rutas HTTP y estáticos | `curso-node-restserver-1.0.0.zip` | Servidor JSON, salud y errores HTTP probados; estáticos cubiertos en turnos |
| MongoDB, usuarios, validación y contraseñas | `curso-node-restserver-2.1.0.zip` | Pendiente |
| Login, JWT y roles | `curso-node-restserver-2.2.0.zip` | Implementado y probado: tokens, permisos, edición y baja lógica |
| Categorías, productos y búsquedas | `curso-node-restserver-4.0.0.zip` | Implementado y probado contra MongoDB temporal |
| Inicio de sesión con Google | `curso-node-restserver-4.0.0.zip` | Adaptador implementado y probado con respuestas controladas; falta login real con cliente propio |
| Archivos locales e imágenes Cloudinary | `curso-node-restserver-5.0.0.zip` | Subida local probada; adaptador Cloudinary probado con proveedor controlado, falta servicio real |
| Eventos, emisión y confirmaciones Socket.IO | `curso-node-socket-server-basico-main.zip` | Cubierto en turnos; se agregará una demostración independiente |
| Cola, escritorios y pantalla pública | `node-curso-socket-colas-main.zip`, `Seccion-15.zip` | Implementado y probado |
| Chat con salas, usuarios y mensajes privados | `socket-chat-1.0.0.zip` | Pendiente |
| Chat autenticado, usuarios activos y últimos mensajes | `curso-node-socket-chat-main.zip` | Pendiente |
| TypeScript, Sequelize, MySQL y CRUD de usuarios | `ts-rest-server-main.zip` | Pendiente |
| Plantillas de interfaz | `HTML-Chat.zip`, `templated-roadtrip.zip` | Recursos de referencia; no se atribuyen como implementación propia |
| Builds estáticos de Angular/React | `Angular-React-Prod-Builds.zip` | Material compilado para servir; no hay proyecto fuente que reconstruir desde este ZIP |
| Códigos HTTP, imágenes y utilidad de scroll | PDF, JPG y `scrollBottom.js` | Referencias y recursos auxiliares |
| Certificado | `UC-cd139af3-7c52-4254-b26a-4b4e41c221a7.pdf` | Sin publicar; se revisará al terminar el código |

## Plan de ejecución

Cada fila funcional se desarrolla con pruebas antes de confirmar el cambio. La API avanza en etapas que siguen las versiones del material: servidor HTTP, persistencia de usuarios, autenticación, catálogo, proveedor Google y archivos. El chat se separa en salas y autenticación. TypeScript conserva Sequelize y MySQL.

Los tests usan archivos y bases de prueba aislados. Las claves locales del profesor o de otras aplicaciones no se copian ni se utilizan. Las integraciones externas sin credenciales se prueban con respuestas controladas y se identifican como pendientes de una prueba real.

No se crean commits vacíos, fechas retroactivas ni fragmentos artificiales para aumentar el contador. Se publica cada avance coherente cuando pasa su verificación.
