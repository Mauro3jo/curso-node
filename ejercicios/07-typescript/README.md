# Usuarios con TypeScript y MySQL

API de usuarios con compilación estricta, Sequelize y MySQL/MariaDB. Incluye alta, listado, consulta, edición y baja lógica, con validación de campos y email único.

Creá una base vacía de práctica y configurá `MYSQL_URL` en el entorno o en un `.env` local. El formato es `mysql://USUARIO:CONTRASEÑA@127.0.0.1:3306/BASE_DE_PRACTICA`; escapá los caracteres especiales de las credenciales como exige una URL. Luego ejecutá `npm run typescript` desde la raíz. El servidor crea la tabla si falta y escucha en `http://127.0.0.1:3004`.

Rutas: `GET/POST /api/usuarios` y `GET/PUT/DELETE /api/usuarios/:id`. El alta y la edición reciben `nombre` y `email`; el servidor administra `estado`.

`npm run build` comprueba tipos y genera `dist/`. Para ejecutar el test SQL contra una instalación existente de MariaDB para Windows sin tocar sus bases, usá `powershell -File scripts/test-mysql.ps1 -MysqlBin C:\xampp\mysql\bin`. El script crea una instancia y un directorio temporales, escucha solo en loopback y los elimina al terminar. En otros entornos, configurá `MYSQL_TEST_URL` con una base nueva de prueba y ejecutá `node --test test/typescript.test.js` después de compilar.

Referencia: `ts-rest-server-main.zip` de Fernando Herrera. Mantiene Sequelize y MySQL del material, sin copiar sus credenciales. La API es una práctica local sin autenticación; no se expone a una red compartida.
