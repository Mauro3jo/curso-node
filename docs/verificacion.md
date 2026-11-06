# Verificación realizada

Comprobaciones del 6 de noviembre de 2026 en Windows, con Node 23.4.0 y npm 10.9.2. Son pruebas de esta reconstrucción, no evidencia de ejecución del código perdido en 2022.

| Comprobación | Resultado |
| --- | --- |
| `npm ci --ignore-scripts` | Instalación limpia desde el lockfile |
| `npm test` | 33 pruebas: 32 aprobadas, 0 fallos, 1 omitida por no definir una base SQL en esa ejecución |
| `powershell -File scripts/test-mysql.ps1` | 2 aprobadas, sin omisiones; incluye el CRUD SQL omitido en la suite general |
| `npm run check` | Sintaxis JavaScript y compilación estricta TypeScript correctas |
| `npm audit --audit-level=low` | 0 vulnerabilidades notificadas por npm |

## Qué se ejercitó

- Consola: orden del event loop, callbacks, promesas, argumentos, creación del archivo de tabla y recorrido real de menús mediante entrada estándar.
- Tareas: altas, filtros, completar/reabrir, borrar y recuperar el JSON al reiniciar.
- Clima: parámetros de Mapbox/OpenWeather, temperaturas en Celsius, respuestas inválidas, errores HTTP, historial y consola de demostración. Se usaron respuestas controladas, sin credenciales reales.
- REST: MongoDB 8.2.6 real en instancias temporales, contraseñas con bcrypt, índices únicos, login, tokens, roles, permisos entre usuarios, catálogo, referencias y bajas lógicas.
- Imágenes: carga local por HTTP, permisos, firma básica y tipo del archivo, tamaño máximo y lectura posterior. El adaptador Cloudinary se comprobó con un proveedor controlado.
- Sockets: clientes Socket.IO reales sobre HTTP local, difusión, confirmaciones, turnos FIFO, salas, privados, historial y rechazo de una sesión desactivada.
- TypeScript: compilación estricta y CRUD sobre MariaDB 10.4.32 usando el dialecto MySQL de Sequelize. El script creó un directorio, una base y un puerto temporales; cerró esa instancia y eliminó su directorio al terminar.
- Web: renderizado Handlebars, parciales, estáticos, 404 y escape de contenido recibido por URL.

## Dependencias

Sequelize usa UUID 11.1.1 mediante un override limitado al ORM. Se probaron sus valores UUIDV1/UUIDV4 y el CRUD SQL. Se evitó `hbs`, que tenía una alerta sin corrección, usando Handlebars directamente como motor de Express. npm sigue mostrando avisos de deprecación de `dottie` y `node-domexception`; no son alertas de vulnerabilidad en esta auditoría.

## Lo que falta comprobar

- El temario completo de la cuenta de Udemy: Computer Use bloqueó la consulta y no se eludió ese límite. La cobertura se basa en los ZIP y enlaces indicados en el inventario.
- La revisión visual e interacción manual de las pantallas en un navegador. Se verificaron HTTP, recursos y eventos, pero no se afirma haber hecho una prueba visual.
- Mapbox y OpenWeather con claves propias; Google con un ID token real para el cliente configurado; Cloudinary con una cuenta propia. Las pruebas de esos proveedores fueron controladas.
- Despliegue y hosting: no se crearon cuentas, recursos de nube ni sitios públicos. Los servidores escuchan en loopback.

No se publicaron bases locales, archivos `.env` ni credenciales del material. La implementación usa dependencias actuales y algunos cambios de seguridad y de interfaz; no se afirma que sea una reproducción exacta de cada lección ni que toda la edición actual del curso esté cubierta.
