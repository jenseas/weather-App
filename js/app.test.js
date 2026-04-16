/**
 * Pruebas unitarias para la aplicación del clima (app.js)
 * Usa Jest para mocks y aserciones.
 * Asume que Jest está configurado con jsdom para simular el DOM.
 */

// Mock global de fetch
global.fetch = jest.fn();

// Configurar DOM simulado antes de cada prueba
beforeEach(() => {
  document.body.innerHTML = `
    <input id="cityInput" type="text" />
    <button id="searchBtn">Buscar</button>
    <div id="result"></div>
  `;
  fetch.mockClear();
});

// Importar la función (asumiendo que app.js exporta fetchWeather; si no, ajusta)
const { fetchWeather } = require('./app.js'); // Ajusta si es necesario

describe('fetchWeather function', () => {
  test('debe mostrar mensaje de error para input vacío (error controlado)', async () => {
    document.getElementById('cityInput').value = '';
    await fetchWeather();
    expect(document.getElementById('result').innerHTML).toBe('⚠️ Escribe una ciudad');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('debe obtener y mostrar clima para búsqueda válida (Guadalajara)', async () => {
    document.getElementById('cityInput').value = 'Guadalajara';

    // Mock geocoding API
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        results: [{
          latitude: 20.6597,
          longitude: -103.3496,
          name: 'Guadalajara',
          country: 'Mexico'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        current_weather: {
          temperature: 25.0,
          windspeed: 5.5,
          time: '2023-10-01T14:00'
        }
      })
    });

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://geocoding-api.open-meteo.com/v1/search?name=Guadalajara&count=1');
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://api.open-meteo.com/v1/forecast?latitude=20.6597&longitude=-103.3496&current_weather=true');

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>Guadalajara, Mexico</h2>');
    expect(result).toContain('🌡️ 25.0 °C');
    expect(result).toContain('💨 5.5 km/h');
    expect(result).toContain('🕒 2023-10-01T14:00');
  });

  test('debe obtener y mostrar clima para ciudad con espacios (New York)', async () => {
    document.getElementById('cityInput').value = 'New York';

    // Mock geocoding API
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        results: [{
          latitude: 40.7128,
          longitude: -74.0060,
          name: 'New York',
          country: 'United States'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        current_weather: {
          temperature: 15.2,
          windspeed: 12.0,
          time: '2023-10-01T16:00'
        }
      })
    });

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://geocoding-api.open-meteo.com/v1/search?name=New%20York&count=1');
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true');

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>New York, United States</h2>');
    expect(result).toContain('🌡️ 15.2 °C');
    expect(result).toContain('💨 12.0 km/h');
    expect(result).toContain('🕒 2023-10-01T16:00');
  });

  test('debe obtener y mostrar clima para caracteres especiales (México)', async () => {
    document.getElementById('cityInput').value = 'México';

    // Mock geocoding API
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        results: [{
          latitude: 19.4326,
          longitude: -99.1332,
          name: 'México City',
          country: 'Mexico'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        current_weather: {
          temperature: 22.8,
          windspeed: 8.3,
          time: '2023-10-01T18:00'
        }
      })
    });

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://geocoding-api.open-meteo.com/v1/search?name=M%C3%A9xico&count=1');
    expect(fetch).toHaveBeenNthCalledWith(2, 'https://api.open-meteo.com/v1/forecast?latitude=19.4326&longitude=-99.1332&current_weather=true');

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>México City, Mexico</h2>');
    expect(result).toContain('🌡️ 22.8 °C');
    expect(result).toContain('💨 8.3 km/h');
    expect(result).toContain('🕒 2023-10-01T18:00');
  });

  test('debe mostrar error para ciudad inexistente', async () => {
    document.getElementById('cityInput').value = 'CiudadInexistente';

    // Mock geocoding API sin resultados
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({})
    });

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.getElementById('result').innerHTML).toBe('❌ Ciudad no encontrada');
  });

  test('debe manejar errores de red', async () => {
    document.getElementById('cityInput').value = 'Madrid';

    // Mock error de red en geocoding
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.getElementById('result').innerHTML).toBe('❌ Ciudad no encontrada');
  });
});