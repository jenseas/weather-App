// Función de inicialización para eventos del DOM
function init() {
  // Evento del botón
  document.getElementById('searchBtn').addEventListener('click', fetchWeather);

  // Evento para presionar Enter en el input
  document.getElementById('cityInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      fetchWeather();
    }
  });
}

// Inicializar solo si estamos en el navegador y no en entorno de pruebas
if (typeof window !== 'undefined' && typeof jest === 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

/**
 * Función principal que obtiene y muestra el clima para una ciudad, estado o región
 *
 * Esta es la función central de la aplicación que coordina todo el proceso:
 * 1. Valida la entrada del usuario
 * 2. Obtiene las coordenadas geográficas usando geocodificación
 * 3. Consulta los datos del clima actual
 * 4. Muestra los resultados en la interfaz de usuario
 *
 * @async
 * @function fetchWeather
 * @returns {Promise<void>} No retorna valor, actualiza la UI directamente
 * @throws {Error} Los errores se manejan internamente y se muestran en la UI
 *
 * @example
 * // Se llama automáticamente al hacer clic en el botón o presionar Enter
 * fetchWeather(); // Obtiene el clima basado en el input del usuario
 *
 * @example
 * // Flujo interno:
 * // 1. Valida que haya texto en el input
 * // 2. Muestra "Cargando..."
 * // 3. Llama a getCoordinates() para obtener lat/lon
 * // 4. Llama a getWeatherData() con las coordenadas
 * // 5. Llama a displayWeather() para mostrar resultados
 * // 6. Si hay error, muestra mensaje de error
 */
async function fetchWeather() {
  const input = document.getElementById('cityInput');
  const result = document.getElementById('result');

  const city = input.value.trim();

  if (!city) {
    result.innerHTML = '⚠️ Escribe una ciudad, estado o región';
    return;
  }

  try {
    result.innerHTML = '⏳ Cargando...';

    // 1. Obtener coordenadas de la ciudad
    const location = await getCoordinates(city);

    // 2. Obtener datos del clima
    const weatherData = await getWeatherData(location.latitude, location.longitude);

    // 3. Mostrar resultados
    displayWeather(location, weatherData);

  } catch (error) {
    result.innerHTML = `❌ ${error.message}`;
  }
}

/**
 * Obtiene las coordenadas de una ciudad usando la API de geocodificación
 * @async
 * @param {string} cityName - Nombre de la ciudad a buscar
 * @returns {Promise<Object>} Objeto con latitude, longitude, name, country, admin1
 * @throws {Error} Si no se encuentra la ciudad o hay error de conexión
 */
async function getCoordinates(cityName) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=es`;

  try {
    const response = await fetch(geoUrl);

    if (!response.ok) {
      throw new Error(`Error de conexión con la API de geocodificación (${response.status})`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error('No se encontró ninguna ciudad, estado o región con ese nombre');
    }

    // Validar que el primer resultado tenga coordenadas
    const location = data.results[0];
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      throw new Error('Datos de coordenadas inválidos en la respuesta de la API');
    }

    return location;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión a internet. Verifica tu conexión.');
    }
    throw error; // Re-lanzar otros errores
  }
}

/**
 * Obtiene los datos del clima actual para unas coordenadas específicas
 *
 * Esta función consulta la API de Open-Meteo para obtener información meteorológica
 * actual basada en coordenadas geográficas (latitud y longitud).
 *
 * @async
 * @function getWeatherData
 * @param {number} latitude - La latitud de la ubicación en grados decimales (ej: 40.4168 para Madrid)
 * @param {number} longitude - La longitud de la ubicación en grados decimales (ej: -3.7038 para Madrid)
 * @returns {Promise<Object>} Un objeto con los datos del clima actual que incluye:
 *   - temperature {number}: Temperatura en grados Celsius
 *   - windspeed {number}: Velocidad del viento en km/h
 *   - time {string}: Timestamp ISO de la medición (ej: "2023-10-01T12:00")
 * @throws {Error} Si hay problemas de conexión a internet
 * @throws {Error} Si la API responde con un código de error HTTP
 * @throws {Error} Si la respuesta de la API no contiene datos del clima actual
 * @throws {Error} Si los datos del clima son incompletos o inválidos
 *
 * @example
 * // Obtener clima de Madrid
 * try {
 *   const weather = await getWeatherData(40.4168, -3.7038);
 *   console.log(`Temperatura: ${weather.temperature}°C`);
 *   console.log(`Viento: ${weather.windspeed} km/h`);
 *   console.log(`Hora: ${weather.time}`);
 * } catch (error) {
 *   console.error('Error al obtener clima:', error.message);
 * }
 *
 * @example
 * // Obtener clima de Nueva York
 * const weather = await getWeatherData(40.7128, -74.0060);
 * // Resultado: { temperature: 15.2, windspeed: 12.5, time: "2023-10-01T16:00" }
 */
async function getWeatherData(latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  try {
    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error(`Error al obtener datos del clima (${response.status})`);
    }

    const data = await response.json();

    if (!data.current_weather) {
      throw new Error('La API no devolvió datos del clima actual');
    }

    // Validar que los datos esenciales estén presentes
    const weather = data.current_weather;
    if (typeof weather.temperature !== 'number' || typeof weather.windspeed !== 'number') {
      throw new Error('Datos del clima incompletos o inválidos');
    }

    return weather;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión a internet. Verifica tu conexión.');
    }
    throw error;
  }
}

/**
 * Muestra los datos del clima en la interfaz
 * @param {Object} location - Datos de la ubicación (name, country, admin1, latitude, longitude)
 * @param {Object} weather - Datos del clima (temperature, windspeed, time)
 */
function displayWeather(location, weather) {
  const result = document.getElementById('result');

  // Construir nombre completo de la ubicación
  const locationName = location.admin1
    ? `${location.name}, ${location.admin1}, ${location.country}`
    : `${location.name}, ${location.country}`;

  result.innerHTML = `
    <h2>${locationName}</h2>
    <p>📍 Coordenadas: ${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°</p>
    <p>🌡️ ${weather.temperature} °C</p>
    <p>💨 ${weather.windspeed} km/h</p>
    <p>🕒 ${weather.time}</p>
  `;
}

// Exportar para pruebas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWeather, getCoordinates, getWeatherData, displayWeather };
}