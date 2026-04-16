// Evento del botón
document.getElementById('searchBtn').addEventListener('click', fetchWeather);

async function fetchWeather() {
  const input = document.getElementById('cityInput');
  const result = document.getElementById('result');

  const city = input.value.trim();

  if (!city) {
    result.innerHTML = '⚠️ Escribe una ciudad';
    return;
  }

  try {
    result.innerHTML = '⏳ Cargando...';

    // 1. Geocoding
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results) {
      throw new Error('Ciudad no encontrada');
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Clima
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const weather = weatherData.current_weather;

    // 3. Mostrar
    result.innerHTML = `
      <h2>${name}, ${country}</h2>
      <p>🌡️ ${weather.temperature} °C</p>
      <p>💨 ${weather.windspeed} km/h</p>
      <p>🕒 ${weather.time}</p>
    `;

  } catch (error) {
    result.innerHTML = `❌ ${error.message}`;
  }
}