import { readJson, writeJson } from '../../lib/json-file.js';

export class Weather {
  #file;
  #history;
  constructor({ file, mapboxKey = process.env.MAPBOX_KEY, weatherKey = process.env.OPENWEATHER_KEY, fetchImpl = fetch } = {}) {
    this.#file = file;
    this.#history = file ? readJson(file, []) : [];
    if (!Array.isArray(this.#history) || !this.#history.every(x => typeof x === 'string')) throw new Error('Historial inválido');
    this.mapboxKey = mapboxKey;
    this.weatherKey = weatherKey;
    this.fetch = fetchImpl;
  }
  get history() { return [...this.#history]; }
  remember(query) {
    if (typeof query !== 'string' || !query.trim() || query.length > 200) throw new Error('Consulta inválida');
    const next = [query.trim(), ...this.#history.filter(x => x.toLowerCase() !== query.trim().toLowerCase())].slice(0, 6);
    if (this.#file) writeJson(this.#file, next);
    this.#history = next;
  }
  async #request(url, provider) {
    let response;
    try { response = await this.fetch(url, { signal: AbortSignal.timeout(10000) }); }
    catch { throw new Error(`No se pudo conectar con ${provider}`); }
    if (!response.ok) throw new Error(`${provider} respondió HTTP ${response.status}`);
    try { return await response.json(); }
    catch { throw new Error(`La respuesta de ${provider} no es JSON válido`); }
  }
  async cities(query) {
    if (!this.mapboxKey) throw new Error('Configurá MAPBOX_KEY para buscar ciudades');
    if (typeof query !== 'string' || !query.trim() || query.length > 200) throw new Error('Consulta inválida');
    const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
    url.search = new URLSearchParams({ q: query.trim(), access_token: this.mapboxKey, language: 'es', types: 'place', limit: '5' });
    const data = await this.#request(url, 'Mapbox');
    if (!Array.isArray(data.features)) throw new Error('Respuesta de Mapbox inválida');
    return data.features.map(feature => {
      const [lng, lat] = feature.geometry?.coordinates || [];
      const nombre = feature.properties?.full_address || feature.properties?.name;
      if (typeof nombre !== 'string' || !Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Respuesta de Mapbox inválida');
      return { id: feature.properties.mapbox_id, nombre, lat, lng };
    });
  }
  async current(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('Coordenadas inválidas');
    if (!this.weatherKey) throw new Error('Configurá OPENWEATHER_KEY para consultar el clima');
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    url.search = new URLSearchParams({ lat, lon: lng, appid: this.weatherKey, units: 'metric', lang: 'es' });
    const data = await this.#request(url, 'OpenWeather');
    const main = data.main, desc = data.weather?.[0]?.description;
    if (![main?.temp, main?.temp_min, main?.temp_max].every(Number.isFinite) || typeof desc !== 'string') throw new Error('Respuesta de OpenWeather inválida');
    return { desc, temp: main.temp, min: main.temp_min, max: main.temp_max };
  }
}
