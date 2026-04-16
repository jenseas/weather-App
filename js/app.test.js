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

// Importar las funciones
const { fetchWeather, getCoordinates, getWeatherData, displayWeather } = require('./app.js');

describe('fetchWeather function', () => {
  test('debe mostrar mensaje de error para input vacío (error controlado)', async () => {
    document.getElementById('cityInput').value = '';
    await fetchWeather();
    expect(document.getElementById('result').innerHTML).toBe('⚠️ Escribe una ciudad, estado o región');
    expect(fetch).not.toHaveBeenCalled();
  });

  test('debe obtener y mostrar clima para búsqueda válida (Guadalajara)', async () => {
    document.getElementById('cityInput').value = 'Guadalajara';

    // Mock geocoding API
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          latitude: 20.6597,
          longitude: -103.3496,
          name: 'Guadalajara',
          country: 'Mexico',
          admin1: 'Jalisco'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      ok: true,
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
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://geocoding-api.open-meteo.com/v1/search?name=Guadalajara&count=10&language=es');

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>Guadalajara, Jalisco, Mexico</h2>');
    expect(result).toContain('🌡️ 25 °C');
    expect(result).toContain('💨 5.5 km/h');
    expect(result).toContain('🕒 2023-10-01T14:00');
  });

  test('debe obtener y mostrar clima para ciudad con espacios (New York)', async () => {
    document.getElementById('cityInput').value = 'New York';

    // Mock geocoding API
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          latitude: 40.7128,
          longitude: -74.0060,
          name: 'New York',
          country: 'United States',
          admin1: 'New York'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      ok: true,
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
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://geocoding-api.open-meteo.com/v1/search?name=New%20York&count=10&language=es');

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>New York, New York, United States</h2>');
    expect(result).toContain('🌡️ 15.2 °C');
    expect(result).toContain('💨 12 km/h');
    expect(result).toContain('🕒 2023-10-01T16:00');
  });

  test('debe obtener y mostrar clima para caracteres especiales (México)', async () => {
    document.getElementById('cityInput').value = 'México';

    // Mock geocoding API
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          latitude: 19.4326,
          longitude: -99.1332,
          name: 'Mexico City',
          country: 'Mexico',
          admin1: 'Mexico City'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      ok: true,
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
    expect(fetch).toHaveBeenNthCalledWith(1, 'https://geocoding-api.open-meteo.com/v1/search?name=M%C3%A9xico&count=10&language=es');

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>Mexico City, Mexico City, Mexico</h2>');
    expect(result).toContain('🌡️ 22.8 °C');
    expect(result).toContain('💨 8.3 km/h');
    expect(result).toContain('🕒 2023-10-01T18:00');
  });

  test('debe mostrar error para ciudad inexistente', async () => {
    document.getElementById('cityInput').value = 'CiudadInexistente';

    // Mock geocoding API sin resultados
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: []
      })
    });

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.getElementById('result').innerHTML).toBe('❌ No se encontró ninguna ciudad, estado o región con ese nombre');
  });

  test('debe manejar errores de red', async () => {
    document.getElementById('cityInput').value = 'Madrid';

    // Mock error de red en geocoding
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(document.getElementById('result').innerHTML).toBe('❌ Network error');
  });

  test('debe obtener clima para estados/regiones (Alaska)', async () => {
    document.getElementById('cityInput').value = 'Alaska';

    // Mock geocoding API para estado/región
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          latitude: 64.2008,
          longitude: -152.2782,
          name: 'Anchorage',
          country: 'United States',
          admin1: 'Alaska'
        }]
      })
    });

    // Mock weather API
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current_weather: {
          temperature: -5.0,
          windspeed: 15.5,
          time: '2023-10-01T20:00'
        }
      })
    });

    await fetchWeather();

    expect(fetch).toHaveBeenCalledTimes(2);
    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('Alaska');
    expect(result).toContain('🌡️ -5 °C');
    expect(result).toContain('💨 15.5 km/h');
  });
});

describe('getCoordinates function', () => {
  test('debe devolver coordenadas válidas para ciudad existente', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          latitude: 40.4168,
          longitude: -3.7038,
          name: 'Madrid',
          country: 'Spain',
          admin1: 'Madrid'
        }]
      })
    });

    const result = await getCoordinates('Madrid');

    expect(fetch).toHaveBeenCalledWith('https://geocoding-api.open-meteo.com/v1/search?name=Madrid&count=10&language=es');
    expect(result).toEqual({
      latitude: 40.4168,
      longitude: -3.7038,
      name: 'Madrid',
      country: 'Spain',
      admin1: 'Madrid'
    });
  });

  test('debe lanzar error para ciudad inexistente', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] })
    });

    await expect(getCoordinates('CiudadInexistente')).rejects.toThrow('No se encontró ninguna ciudad, estado o región con ese nombre');
  });

  test('debe lanzar error para problemas de conexión', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(getCoordinates('Madrid')).rejects.toThrow('Error de conexión a internet. Verifica tu conexión.');
  });
});

describe('getWeatherData function', () => {
  test('debe devolver datos del clima válidos', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        current_weather: {
          temperature: 20.5,
          windspeed: 10.2,
          time: '2023-10-01T12:00'
        }
      })
    });

    const result = await getWeatherData(40.4168, -3.7038);

    expect(fetch).toHaveBeenCalledWith('https://api.open-meteo.com/v1/forecast?latitude=40.4168&longitude=-3.7038&current_weather=true');
    expect(result).toEqual({
      temperature: 20.5,
      windspeed: 10.2,
      time: '2023-10-01T12:00'
    });
  });

  test('debe lanzar error para respuesta sin current_weather', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({})
    });

    await expect(getWeatherData(40.4168, -3.7038)).rejects.toThrow('La API no devolvió datos del clima actual');
  });
});

describe('displayWeather function', () => {
  test('debe mostrar datos del clima correctamente', () => {
    const location = {
      name: 'Madrid',
      country: 'Spain',
      admin1: 'Madrid',
      latitude: 40.4168,
      longitude: -3.7038
    };

    const weather = {
      temperature: 20.5,
      windspeed: 10.2,
      time: '2023-10-01T12:00'
    };

    displayWeather(location, weather);

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>Madrid, Madrid, Spain</h2>');
    expect(result).toContain('📍 Coordenadas: 40.42°, -3.70°');
    expect(result).toContain('🌡️ 20.5 °C');
    expect(result).toContain('💨 10.2 km/h');
    expect(result).toContain('🕒 2023-10-01T12:00');
  });

  test('debe manejar ubicación sin admin1', () => {
    const location = {
      name: 'Madrid',
      country: 'Spain',
      latitude: 40.4168,
      longitude: -3.7038
    };

    const weather = {
      temperature: 20.5,
      windspeed: 10.2,
      time: '2023-10-01T12:00'
    };

    displayWeather(location, weather);

    const result = document.getElementById('result').innerHTML;
    expect(result).toContain('<h2>Madrid, Spain</h2>');
  });
});