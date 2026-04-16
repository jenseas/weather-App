// Evento del botón
document.getElementById('searchBtn').addEventListener('click', fetchWeather);

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

    // 1. Geocoding - Obtener resultados
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=es`
    );
    
    if (!geoRes.ok) {
      throw new Error('Error al conectar con la API de geocodificación');
    }

    const geoData = await geoRes.json();

    // Validar que haya resultados
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('No se encontró ninguna ciudad, estado o región con ese nombre');
    }

    // Usar el primer resultado
    const location = geoData.results[0];
    const { latitude, longitude, name, country, admin1 } = location;

    // Construir nombre más completo (incluir admin1 si existe)
    const locationName = admin1 ? `${name}, ${admin1}, ${country}` : `${name}, ${country}`;

    // 2. Obtener clima
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    if (!weatherRes.ok) {
      throw new Error('Error al obtener datos del clima');
    }

    const weatherData = await weatherRes.json();

    if (!weatherData.current_weather) {
      throw new Error('No se pudieron obtener los datos del clima');
    }

    const weather = weatherData.current_weather;

    // 3. Mostrar resultados
    result.innerHTML = `
      <h2>${locationName}</h2>
      <p>📍 Coordenadas: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°</p>
      <p>🌡️ ${weather.temperature} °C</p>
      <p>💨 ${weather.windspeed} km/h</p>
      <p>🕒 ${weather.time}</p>
    `;

  } catch (error) {
    result.innerHTML = `❌ ${error.message}`;
  }
}

// Exportar para pruebas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWeather };
}