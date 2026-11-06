# Aplicaciones con Node.js

Tareas de consola, consulta de clima, una API de catálogo y aplicaciones en tiempo real con Socket.IO. Cada proyecto está separado y se puede ejecutar desde esta carpeta.

## Empezar

Requiere Node.js 22 o superior y npm.

```sh
npm ci
npm start
```

`npm start` abre el servidor de **turnos** en [localhost:3000](http://127.0.0.1:3000). Abrí las opciones de sacar turno, escritorio y pantalla pública en pestañas distintas para probar el circuito. Los números se guardan localmente y se reinician al cambiar el día.

| Aplicación | Comando | Detalles |
| --- | --- | --- |
| Funciones y event loop | `npm run fundamentos` | Salida por consola |
| Callbacks y promesas | `npm run asincronia` | [Ejemplo de async/await](ejercicios/01-fundamentos) |
| Tablas con argumentos | `npm run tablas -- --base 5 --listar` | [CLI y archivos de texto](ejercicios/09-tablas) |
| Tareas | `npm run tareas` | [Menú, estados y archivo JSON](ejercicios/02-tareas) |
| Clima | `npm run clima -- --demo` | [Ciudades, temperatura e historial](ejercicios/03-clima) |
| API y chat autenticado | `npm run rest -- --demo` | [Usuarios, JWT, catálogo e imágenes](ejercicios/04-rest), puerto 3001 |
| Sockets básicos | `npm run sockets` | [Eventos y confirmaciones](ejercicios/05-sockets), puerto 3002 |
| Chat por salas | `npm run chat` | [Participantes y privados](ejercicios/06-chat), puerto 3003 |
| Usuarios con TypeScript | `npm run typescript` | [Sequelize y MySQL/MariaDB](ejercicios/07-typescript), puerto 3004 |
| Catálogo web | `npm run web` | [Express y plantillas Handlebars](ejercicios/08-web), puerto 3005 |

Las demostraciones de clima usan datos ficticios; las de API usan un MongoDB temporal que descarga su binario oficial la primera vez. Para datos persistentes, proveedores reales o MySQL, seguí la configuración del README de cada proyecto. Las claves y los datos locales no se suben a Git.

## Comprobar

```sh
npm test
npm run check
```

`npm test` compila TypeScript y prueba consola, HTTP, MongoDB y sockets. El test SQL necesita una base de prueba: en Windows con MariaDB ya instalado se puede ejecutar `powershell -File scripts/test-mysql.ps1`; el script prepara una instancia aislada y la elimina al terminar. Sin `MYSQL_TEST_URL`, ese test aparece como omitido.

Los servidores escuchan solo en esta computadora. Son aplicaciones de práctica para una instancia, sin despliegue público.

Referencia: materiales de **Node: De cero a experto**, de Fernando Herrera ([Klerith](https://github.com/Klerith)). El código se reconstruyó a partir de esos materiales. [Cobertura y pendientes](docs/alcance.md) · [Pruebas realizadas](docs/verificacion.md).
