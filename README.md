# 🌦️ Weather App

Aplicación web que permite consultar el clima actual y pronóstico de múltiples ciudades de forma simultánea.

---

## 🚀 Características

* 🔍 **Búsqueda flexible**: Busca por ciudad, estado, provincia o región
* 🌍 **Múltiples ciudades**: Consulta el clima de varias ciudades al mismo tiempo separadas por comas
* 📅 **Pronóstico extendido**: Muestra pronóstico del clima para los próximos 7 días
* 📊 **Detalles completos**: Temperatura, velocidad del viento, humedad y precipitación
* 📱 **Diseño compacto**: Optimizado para caber en una pantalla con dos tarjetas principales
* 🔽 **Funcionalidad de colapso**: El pronóstico de 7 días se puede mostrar/ocultar con un botón para ahorrar espacio
* 💾 **Almacenamiento en caché**: Datos almacenados localmente con caducidad automática (30 min para clima, 24h para coordenadas)
* 📴 **Modo sin conexión**: Funciona offline mostrando datos en caché cuando no hay internet
* ⚡ **Consultas paralelas**: Carga rápida mediante procesamiento simultáneo de múltiples solicitudes
* 🎨 **Interfaz moderna**: Diseño responsive y atractivo con tarjetas para cada ciudad
* 🧪 **Pruebas completas**: Cobertura de testing con Jest

---

## 🧱 Tecnologías utilizadas

* HTML5
* CSS3
* JavaScript (ES6+)
* Fetch API
* Open-Meteo API

---

## 📁 Estructura del proyecto

```
weather-app/
│
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
```

---

## ⚙️ Instalación y ejecución

### Requisitos del sistema

- **Navegador moderno**: Chrome, Firefox, Safari, Edge (actualizado)
- **Conexión a internet**: Requerida para acceder a las APIs de Open-Meteo
- **Sin dependencias externas**: No requiere instalación de paquetes npm para la aplicación base

### Pasos de instalación

1. **Clona o descarga este repositorio**
   ```bash
   git clone https://github.com/tuusuario/weather-app.git
   cd weather-app
   ```

2. **Abre la carpeta en Visual Studio Code** (opcional, pero recomendado)
   ```bash
   code .
   ```

3. **Instala la extensión Live Server** (si deseas usar Live Server)
   - Busca "Live Server" en VS Code Extensions
   - Haz clic en "Install"

4. **Ejecuta la aplicación**
   - **Opción 1 (Con Live Server)**: Haz clic derecho en `index.html` → "Open with Live Server"
   - **Opción 2 (Local)**: Abre directamente `index.html` en tu navegador

### Instalación de dependencias para pruebas (Opcional)

Si deseas ejecutar las pruebas unitarias:

```bash
npm install
npm test
```

---

## 📖 Uso de la aplicación

### En la interfaz gráfica (navegador)

1. Abre `index.html` en tu navegador
2. Verás un campo de búsqueda con el placeholder "Buscar ciudad(es)..."
3. **Opción 1**: Ingresa el nombre de una ciudad (ej: "Madrid")
4. **Opción 2**: Ingresa varias ciudades separadas por comas (ej: "Madrid, Barcelona, Sevilla")
5. **Haz clic en el botón "Buscar" o presiona Enter en tu teclado**
6. Espera a que cargue (verás "⏳ Cargando...")
7. Se mostrarán los datos del clima actual y pronóstico para cada ciudad
8. **Funcionalidad de colapso**: Haz clic en el botón "📅 Pronóstico de 7 días ▼" para mostrar/ocultar el pronóstico extendido y ahorrar espacio en pantalla

### Ejemplo de uso correcto

```
✅ Una ciudad: "Madrid"
✅ Varias ciudades: "Madrid, Barcelona, Sevilla"
✅ Con espacios: "New York, Los Angeles"
✅ Caracteres especiales: "México, São Paulo"
✅ Estados/regiones: "Alaska, California" (busca la ciudad principal)
```

### Salida esperada

Para una sola ciudad:
```
📍 Guadalajara, Jalisco, Mexico
📍 Coordenadas: 20.66°, -103.35°

🌤️ Clima Actual
🌡️ 25.0 °C
💨 5.5 km/h
💧 Humedad: 65%
🌧️ Precipitación: 0 mm

📅 Pronóstico 7 días
[Cuadrícula con pronóstico diario]
```

Para múltiples ciudades, verás tarjetas separadas para cada una.

---

## 🔑 Configuración de la API

### Autenticación

**Buena noticia**: La API de Open-Meteo **no requiere clave API** ni autenticación. Es completamente gratuita y accesible públicamente.

### Límites de uso

- Geocoding API: Hasta 1 solicitud por segundo
- Weather Forecast API: Hasta 10,000 solicitudes al día desde la misma IP

Si necesitas límites mayores, consulta la [documentación oficial de Open-Meteo](https://open-meteo.com).

---

## 💾 Sistema de Caché

### Funcionalidad de caché

La aplicación incluye un sistema de caché inteligente que mejora el rendimiento y permite funcionamiento offline:

- **Coordenadas**: Se almacenan por 24 horas (las coordenadas no cambian)
- **Datos del clima**: Se almacenan por 30 minutos (datos meteorológicos se actualizan frecuentemente)
- **Almacenamiento**: Usa `localStorage` del navegador para persistencia local
- **Caducidad automática**: Los datos expirados se eliminan automáticamente

### Beneficios del caché

- 🚀 **Rendimiento**: Las búsquedas repetidas son instantáneas
- 📱 **Offline**: Funciona sin conexión mostrando datos en caché
- 💰 **Ahorro de API**: Reduce llamadas a la API externa
- 🔄 **Actualización automática**: Los datos se refrescan cuando expiran

### Modo sin conexión

Cuando no hay conexión a internet:
1. La app detecta automáticamente la falta de conexión
2. Busca datos en caché para las ciudades solicitadas
3. Muestra los datos disponibles con una nota de "Modo sin conexión"
4. Si no hay caché válido, muestra mensaje informativo

### Funciones de caché

```javascript
// Almacenar datos con TTL
cacheSet('key', data, ttlMinutes);

// Recuperar datos (null si expiró)
const data = cacheGet('key');

// Verificar conexión
const online = isOnline();
```

---

## ⚠️ Manejo de errores

### Errores comunes y soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "⚠️ Escribe una ciudad, estado o región" | Campo vacío o solo espacios | Ingresa una ciudad válida |
| "❌ No se encontró ninguna ciudad..." | Ciudad no existe o nombre incorrecto | Verifica la ortografía o intenta con otro nombre |
| "❌ Error al conectar con la API de geocodificación" | Problema de conexión o API caída | Verifica tu conexión a internet; reintentar más tarde |
| "❌ Error al obtener datos del clima" | Problema con la API de clima | Verifica conexión; puede ser issue temporal de Open-Meteo |
| "❌ No se pudieron obtener los datos del clima" | Respuesta incompleta de API | Reintentar; si persiste, contactar soporte |

### Flujo de manejo de errores

```javascript
try {
  1. Validar entrada (no vacía)
  2. Llamar API de geocodificación
  3. Validar que haya resultados
  4. Llamar API de clima
  5. Validar datos del clima
  6. Mostrar resultados
} catch (error) {
  Mostrar mensaje descriptivo del error
}
```

---

## 📊 Formato de respuesta de las APIs

### Respuesta Geocoding API (exitosa)

```json
{
  "results": [
    {
      "id": 2988507,
      "name": "Guadalajara",
      "latitude": 20.6597,
      "longitude": -103.3496,
      "elevation": 1564,
      "feature_code": "PPLA",
      "country_code": "MX",
      "admin1": "Jalisco",
      "admin1_id": 3589172,
      "admin2": "Guadalajara",
      "admin2_id": 3589173,
      "timezone": "America/Mexico_City",
      "population": 4434252,
      "country_id": 3996063,
      "country": "Mexico"
    }
  ],
  "generationtime_ms": 1.5
}
```

### Respuesta Weather API (exitosa)

```json
{
  "latitude": 20.6597,
  "longitude": -103.3496,
  "generationtime_ms": 0.7,
  "utc_offset_seconds": -25200,
  "timezone": "America/Mexico_City",
  "timezone_abbreviation": "CDT",
  "elevation": 1564,
  "current_weather": {
    "temperature": 25.0,
    "windspeed": 5.5,
    "winddirection": 180,
    "weathercode": 0,
    "time": "2023-10-01T14:00"
  }
}
```

### Respuesta con error (ciudad no encontrada)

```json
{
  "results": null,
  "generationtime_ms": 2.3
}
```

---

## 🧪 Casos de prueba

- ✔ Búsqueda válida (Guadalajara)
- ✔ Ciudad con espacios (New York)
- ✔ Input vacío (error controlado)
- ✔ Ciudad inexistente
- ✔ Caracteres especiales (México)
- ✔ Manejo de errores de red
- ✔ Estados y regiones (Alaska)

### Ejecutar pruebas

```bash
npm install  # Primera vez
npm test     # Ejecutar tests
npm test -- --coverage  # Con reporte de cobertura
```

---

## 🔧 Mejoras implementadas

- **Búsqueda más flexible**: Ahora acepta ciudades, estados, provincias y regiones
- **Múltiples resultados**: Búsqueda con `count=10` para mayor flexibilidad
- **Mejor información**: Incluye `admin1` (estado/provincia) en la ubicación cuando está disponible
- **Coordenadas visibles**: Se muestran latitud y longitud en la salida
- **Errores más descriptivos**: Mensajes específicos para diferentes tipos de fallos
- **Validación mejorada**: Verifica arrays vacíos y respuestas incompletas de APIs
- **Idioma español**: Parámetro `language=es` en búsquedas geocodificadas
- **Advertencia de búsqueda**: Hint visible indicando cómo realizar búsquedas correctamente
- **Código modular**: Función `fetchWeather` dividida en `getCoordinates`, `getWeatherData` y `displayWeather` para mejor claridad y mantenibilidad
- **Manejo de errores mejorado**: Diferenciación entre errores de red y errores de API
- **Documentación JSDoc**: Comentarios detallados para cada función

## 🔁 Flujo de funcionamiento

1. El usuario ingresa una ciudad
2. Se consulta la API de geocodificación (`getCoordinates`)
3. Se obtienen coordenadas (lat, lon)
4. Se consulta la API de clima (`getWeatherData`)
5. Se muestran los datos en pantalla (`displayWeather`)

### Arquitectura del código

```
fetchWeather()          // Función principal
├── getCoordinates()    // Obtiene lat/lon de ciudad
├── getWeatherData()    // Obtiene clima de coordenadas
└── displayWeather()    // Muestra resultados en UI
```

Cada función tiene responsabilidades claras y puede ser probada independientemente.

---

## 🌐 APIs utilizadas

### Geocoding

```
https://geocoding-api.open-meteo.com/v1/search
```

**Parámetros principales:**
- `name`: Nombre de la ciudad a buscar
- `count`: Número máximo de resultados (default: 10)
- `language`: Idioma de respuesta (ej: es, en, fr)

### Weather Forecast

```
https://api.open-meteo.com/v1/forecast
```

**Parámetros principales:**
- `latitude`: Latitud de la ubicación
- `longitude`: Longitud de la ubicación
- `current_weather`: true (para obtener clima actual)

---

## 📌 Ejemplo de uso

### En la interfaz gráfica

1. Abre `index.html` en tu navegador
2. Ingresa "Madrid" en el campo de búsqueda
3. Haz clic en "Buscar"
4. Se mostrarán los datos meteorológicos de Madrid

### Salida esperada

```
Madrid, Community of Madrid, Spain
📍 Coordenadas: 40.42°, -3.70°
🌡️ 20 °C
💨 10 km/h
🕒 2023-10-01T12:00
```

---

## 🛠️ Solución de problemas

### La app no muestra resultados

**Problema**: Buscas una ciudad pero no obtiene resultados

**Soluciones:**
1. Verifica la ortografía de la ciudad
2. Asegúrate de estar buscando por **nombre de ciudad**, no de estado/país
3. Intenta con otra ciudad conocida (ej: "Madrid", "Paris")
4. Verifica tu conexión a internet

### Aparece error "Error al conectar con la API"

**Problema**: No se puede conectar a la API de Open-Meteo

**Soluciones:**
1. Verifica que tengas conexión a internet
2. Comprueba si el sitio https://open-meteo.com está accesible
3. Intenta después de unos minutos (posible problema temporal del servidor)
4. Revisa la consola del navegador (F12) para más detalles

### Las pruebas no ejecutan

**Problema**: `npm test` falla con error

**Soluciones:**
```bash
# 1. Reinstala dependencias
rm -rf node_modules package-lock.json
npm install

# 2. Verifica que Jest esté instalado
npm list jest

# 3. Ejecuta en modo verbose para más información
npm test -- --verbose
```

### Live Server no funciona

**Problema**: No se abre la página con Live Server

**Soluciones:**
1. Asegúrate de tener la extensión instalada en VS Code
2. Haz clic derecho directamente en `index.html` (no en una carpeta)
3. Intenta usar otro puerto (Live Server usa 5500 por defecto)
4. Reinicia VS Code

---

## 🚀 Mejoras futuras

- Mostrar temperatura en °F (Fahrenheit)
- Iconos según condición del clima
- Geolocalización automática del usuario
- Guardar últimas búsquedas (localStorage)
- UI tipo app móvil con PWA
- Pronóstico de varios días
- Índice UV y humedad

---

## 💡 Consejos de uso

- Para mejores resultados, busca por **ciudades grandes y conocidas**
- Algunas ciudades pequeñas pueden no estar disponibles en la API
- La API responde en tiempo real, sin cachés locales
- Los datos se actualizan cada vez que realizas una búsqueda

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 👩‍💻 Autor

Proyecto desarrollado como práctica de consumo de APIs y desarrollo frontend.

**Tecnologías aprendidas:**
- Integración de APIs REST
- Promesas y async/await
- DOM manipulation
- CSS Grid y Flexbox
- Testing con Jest
- Git y control de versiones

---

## 📄 Licencia

Uso libre para fines educativos. Consulta el archivo `LICENSE` para más detalles.

---

## 📚 Recursos útiles

- [Open-Meteo API Documentation](https://open-meteo.com/en/docs)
- [Geocoding API Documentation](https://open-meteo.com/en/docs/geocoding-api)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)
- [Jest Testing Framework](https://jestjs.io/)

---

**Última actualización**: Abril 2026 | Versión 1.0.0

