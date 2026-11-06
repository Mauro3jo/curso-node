# Clima de ciudades

Busca una ciudad con Mapbox, consulta su clima actual en OpenWeather y conserva las últimas seis consultas escritas por el usuario.

Desde la raíz: `npm run clima -- --demo` para recorrer el menú con datos ficticios. Para consultar datos reales, configurá `MAPBOX_KEY` y `OPENWEATHER_KEY` en tu entorno o en un `.env` local y ejecutá `npm run clima`.

El cliente usa [Geocoding v6 de Mapbox](https://docs.mapbox.com/api/search/geocoding/) y [Current Weather de OpenWeather](https://openweathermap.org/current), en español y grados Celsius. El material original usaba Geocoding v5 y Axios; esta versión usa v6 y `fetch` de Node. El historial guarda la consulta escrita, sin almacenar resultados temporales de Mapbox.

Referencia: `node-clima-app-main.zip` de Fernando Herrera. Los adaptadores y la consola se prueban sin claves; la consulta a proveedores reales requiere credenciales propias y no se verificó en esta reconstrucción.
