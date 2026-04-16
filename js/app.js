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

// Función para mostrar/ocultar el pronóstico
function toggleForecast(forecastId) {
  const forecast = document.getElementById(forecastId);
  const button = forecast.previousElementSibling.querySelector('.forecast-btn');

  if (forecast.classList.contains('forecast-collapsed')) {
    forecast.classList.remove('forecast-collapsed');
    button.innerHTML = '📅 Pronóstico de 7 días ▲';
  } else {
    forecast.classList.add('forecast-collapsed');
    button.innerHTML = '📅 Pronóstico de 7 días ▼';
  }
}

/**
 * Almacena datos en caché con tiempo de vida (TTL)
 * @param {string} key - Clave única para identificar los datos
 * @param {*} data - Datos a almacenar
 * @param {number} ttlMinutes - Tiempo de vida en minutos (por defecto 30)
 */
function cacheSet(key, data, ttlMinutes = 30) {
  const expiry = Date.now() + (ttlMinutes * 60 * 1000);
  const cacheData = {
    data: data,
    expiry: expiry
  };
  localStorage.setItem(key, JSON.stringify(cacheData));
}

/**
 * Recupera datos de caché si no han expirado
 * @param {string} key - Clave de los datos a recuperar
 * @returns {*} Los datos si son válidos, null si expiraron o no existen
 */
function cacheGet(key) {
  const cacheString = localStorage.getItem(key);
  if (!cacheString) return null;

  try {
    const cacheData = JSON.parse(cacheString);
    if (Date.now() > cacheData.expiry) {
      localStorage.removeItem(key); // Limpiar caché expirado
      return null;
    }
    return cacheData.data;
  } catch (error) {
    localStorage.removeItem(key); // Limpiar caché corrupto
    return null;
  }
}

/**
 * Verifica si hay conexión a internet
 * @returns {boolean} true si hay conexión, false si no
 */
function isOnline() {
  return navigator.onLine;
}

/**
 * Carga datos del clima desde caché cuando no hay conexión a internet
 * @async
 * @param {string} citiesText - Texto con las ciudades separadas por comas
 * @returns {Promise<void>} Actualiza la UI con datos en caché o mensaje de error
 */
async function loadFromCache(citiesText) {
  const result = document.getElementById('result');
  const cityNames = citiesText.split(',').map(city => city.trim()).filter(city => city);

  let locations = [];
  let weatherDataArray = [];
  let hasValidCache = false;

  try {
    for (const city of cityNames) {
      const coordsCacheKey = `coords_${city.toLowerCase()}`;
      const coords = cacheGet(coordsCacheKey);

      if (coords) {
        const weatherCacheKey = `weather_${coords.latitude.toFixed(2)}_${coords.longitude.toFixed(2)}`;
        const weatherData = cacheGet(weatherCacheKey);

        if (weatherData) {
          locations.push(coords);
          weatherDataArray.push(weatherData);
          hasValidCache = true;
        }
      }
    }

    if (hasValidCache && locations.length > 0) {
      result.innerHTML = '📱 Modo sin conexión - Mostrando datos en caché<br><small>Los datos pueden estar desactualizados</small>';
      displayWeather(locations, weatherDataArray);
    } else {
      result.innerHTML = '❌ Sin conexión a internet y no hay datos en caché disponibles.<br>Conéctate a internet para obtener datos actualizados.';
    }
  } catch (error) {
    result.innerHTML = '❌ Error al cargar datos desde caché.';
  }
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
 * Función principal que obtiene y muestra el clima para una o varias ciudades
 *
 * Esta función coordina el proceso completo:
 * 1. Valida y procesa la entrada (soporta múltiples ciudades separadas por comas)
 * 2. Obtiene coordenadas para cada ciudad en paralelo (con caché)
 * 3. Consulta datos del clima para todas las ubicaciones simultáneamente (con caché)
 * 4. Muestra resultados con pronóstico diario y detalles adicionales
 * 5. Maneja escenarios sin conexión usando datos en caché
 *
 * @async
 * @function fetchWeather
 * @returns {Promise<void>} No retorna valor, actualiza la UI directamente
 * @throws {Error} Los errores se manejan internamente y se muestran en la UI
 */
async function fetchWeather() {
  const input = document.getElementById('cityInput');
  const result = document.getElementById('result');

  const citiesText = input.value.trim();

  if (!citiesText) {
    result.innerHTML = '⚠️ Escribe una o varias ciudades separadas por comas';
    return;
  }

  try {
    result.innerHTML = '⏳ Cargando...';

    // Procesar múltiples ciudades
    const cityNames = citiesText.split(',').map(city => city.trim()).filter(city => city);

    if (cityNames.length === 0) {
      result.innerHTML = '⚠️ Escribe al menos una ciudad válida';
      return;
    }

    // 1. Obtener coordenadas para todas las ciudades en paralelo (con caché)
    const locationPromises = cityNames.map(city => getCoordinates(city));
    const locations = await Promise.all(locationPromises);

    // 2. Obtener datos del clima para todas las ubicaciones en paralelo (con caché)
    const weatherPromises = locations.map(location =>
      getWeatherData(location.latitude, location.longitude)
    );
    const weatherDataArray = await Promise.all(weatherPromises);

    // 3. Mostrar resultados
    displayWeather(locations, weatherDataArray);

  } catch (error) {
    // Manejar escenarios sin conexión
    if (!isOnline()) {
      result.innerHTML = '📴 Sin conexión a internet. Mostrando datos en caché si disponibles...';
      // Intentar cargar desde caché
      await loadFromCache(citiesText);
    } else {
      result.innerHTML = `❌ ${error.message}`;
    }
  }
}

/**
 * Obtiene las coordenadas de una ciudad usando la API de geocodificación (con caché)
 * @async
 * @param {string} cityName - Nombre de la ciudad a buscar
 * @returns {Promise<Object>} Objeto con latitude, longitude, name, country, admin1
 * @throws {Error} Si no se encuentra la ciudad o hay error de conexión
 */
async function getCoordinates(cityName) {
  const cacheKey = `coords_${cityName.toLowerCase()}`;

  // Verificar caché primero
  const cachedData = cacheGet(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Si no hay caché o expiró, consultar API
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

    // Almacenar en caché (TTL: 24 horas para coordenadas, ya que no cambian)
    cacheSet(cacheKey, location, 1440);

    return location;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión a internet. Verifica tu conexión.');
    }
    throw error; // Re-lanzar otros errores
  }
}

/**
 * Obtiene los datos del clima actual y pronóstico para varios días (con caché)
 *
 * Esta función consulta la API de Open-Meteo para obtener información meteorológica
 * completa basada en coordenadas geográficas, incluyendo clima actual y pronóstico diario.
 * Utiliza caché para mejorar rendimiento y permitir funcionamiento offline.
 *
 * @async
 * @function getWeatherData
 * @param {number} latitude - La latitud de la ubicación en grados decimales
 * @param {number} longitude - La longitud de la ubicación en grados decimales
 * @returns {Promise<Object>} Un objeto con los datos del clima que incluye:
 *   - current: {temperature, windspeed, time, humidity, precipitation}
 *   - daily: {dates, temperatures_max, temperatures_min, precipitation_sum, windspeed_max}
 * @throws {Error} Si hay problemas de conexión a internet
 * @throws {Error} Si la API responde con un código de error HTTP
 * @throws {Error} Si los datos del clima son incompletos o inválidos
 */
async function getWeatherData(latitude, longitude) {
  const cacheKey = `weather_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

  // Verificar caché primero
  const cachedData = cacheGet(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Si no hay caché o expiró, consultar API
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;

  try {
    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error(`Error al obtener datos del clima (${response.status})`);
    }

    const data = await response.json();

    if (!data.current_weather || !data.daily) {
      throw new Error('La API no devolvió datos completos del clima');
    }

    // Validar datos actuales
    const current = data.current_weather;
    if (typeof current.temperature !== 'number' || typeof current.windspeed !== 'number') {
      throw new Error('Datos del clima actual incompletos o inválidos');
    }

    // Validar datos diarios
    const daily = data.daily;
    if (!daily.time || !daily.temperature_2m_max || !daily.temperature_2m_min) {
      throw new Error('Datos del pronóstico diario incompletos');
    }

    const weatherData = {
      current: {
        temperature: current.temperature,
        windspeed: current.windspeed,
        time: current.time,
        humidity: current.relative_humidity || null, // Puede no estar disponible
        precipitation: current.precipitation || 0
      },
      daily: {
        dates: daily.time,
        temperatures_max: daily.temperature_2m_max,
        temperatures_min: daily.temperature_2m_min,
        precipitation_sum: daily.precipitation_sum || [],
        windspeed_max: daily.windspeed_10m_max || []
      }
    };

    // Almacenar en caché (TTL: 30 minutos para datos del clima)
    cacheSet(cacheKey, weatherData, 30);

    return weatherData;

  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Error de conexión a internet. Verifica tu conexión.');
    }
    throw error;
  }
}

/**
 * Muestra los datos del clima para una o varias ubicaciones con pronóstico colapsable
 * @param {Array|Object} locations - Datos de ubicación(es) (puede ser array para múltiples)
 * @param {Array|Object} weatherDataArray - Datos del clima (puede ser array para múltiples)
 */
function displayWeather(locations, weatherDataArray) {
  const result = document.getElementById('result');

  // Si es una sola ubicación (compatibilidad hacia atrás)
  if (!Array.isArray(locations)) {
    locations = [locations];
    weatherDataArray = [weatherDataArray];
  }

  let html = '';

  locations.forEach((location, index) => {
    const weatherData = weatherDataArray[index];
    const locationName = location.admin1
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`;

    // Generar ID único para el botón de colapso
    const forecastId = `forecast-${index}`;

    html += `
      <div class="weather-card">
        <h2>${locationName}</h2>
        <p>📍 Coordenadas: ${location.latitude.toFixed(2)}°, ${location.longitude.toFixed(2)}°</p>

        <div class="current-weather">
          <h3>🌤️ Clima Actual</h3>
          <p>🌡️ ${weatherData.current.temperature} °C</p>
          <p>💨 ${weatherData.current.windspeed} km/h</p>
          ${weatherData.current.humidity ? `<p>💧 Humedad: ${weatherData.current.humidity}%</p>` : ''}
          <p>🌧️ Precipitación: ${weatherData.current.precipitation || 0} mm</p>
          <p>🕒 ${new Date(weatherData.current.time).toLocaleString('es-ES')}</p>
        </div>

        <div class="forecast-toggle">
          <button class="forecast-btn" onclick="toggleForecast('${forecastId}')">
            📅 Pronóstico de 7 días ▼
          </button>
        </div>

        <div class="forecast forecast-collapsed" id="${forecastId}">
          <div class="forecast-grid">
    `;

    // Mostrar pronóstico para los próximos 7 días
    const maxDays = Math.min(7, weatherData.daily.dates.length);
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(weatherData.daily.dates[i]);
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const tempMax = weatherData.daily.temperatures_max[i];
      const tempMin = weatherData.daily.temperatures_min[i];
      const precip = weatherData.daily.precipitation_sum[i] || 0;
      const windMax = weatherData.daily.windspeed_max[i] || weatherData.current.windspeed;

      html += `
        <div class="forecast-day">
          <div class="day-name">${dayName}</div>
          <div class="temp-range">${tempMax}° / ${tempMin}°</div>
          <div class="precip">🌧️ ${precip}mm</div>
          <div class="wind">💨 ${windMax}km/h</div>
        </div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;
  });

  result.innerHTML = html;
}

// Exportar para pruebas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWeather, getCoordinates, getWeatherData, displayWeather };
}