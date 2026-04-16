# 🌦️ Weather App

Aplicación web sencilla que permite consultar el clima actual de una ciudad utilizando la API de Open-Meteo.

---

## 🚀 Características

* Búsqueda de ciudad por nombre
* Conversión de ciudad → coordenadas (latitud y longitud)
* Consulta de clima en tiempo real
* Interfaz simple y amigable
* Manejo de errores (ciudad no encontrada, campos vacíos)

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

1. Clona o descarga este repositorio
2. Abre la carpeta en Visual Studio Code
3. Instala la extensión **Live Server**
4. Haz clic derecho en `index.html`
5. Selecciona **"Open with Live Server"**

---

## 🧪 Casos de prueba

- ✔ Búsqueda válida (Guadalajara)
- ✔ Ciudad con espacios (New York)
- ✔ Input vacío (error controlado)
- ✔ Ciudad inexistente
- ✔ Caracteres especiales (México)
- ✔ Manejo de errores de red
- ✔ Estados y regiones (Alaska)

---

## 🔧 Mejoras implementadas

- **Búsqueda más flexible**: Ahora acepta ciudades, estados, provincias y regiones (no solo ciudades)
- **Múltiples resultados**: Búsqueda con `count=10` para mayor relevancia
- **Mejor información**: Incluye `admin1` (estado/provincia) en la ubicación cuando está disponible
- **Coordenadas visibles**: Se muestran latitud y longitud en la salida
- **Errores más descriptivos**: Mensajes específicos para diferentes tipos de fallos
- **Validación mejorada**: Verifica arrays vacíos y respuestas incompletas de APIs
- **Idioma español**: Parámetro `language=es` en búsquedas geocodificadas

## 🔁 Flujo de funcionamiento

1. El usuario ingresa una ciudad
2. Se consulta la API de geocodificación
3. Se obtienen coordenadas (lat, lon)
4. Se consulta la API de clima
5. Se muestran los datos en pantalla

---

## 🌐 APIs utilizadas

### Geocoding

```
https://geocoding-api.open-meteo.com/v1/search
```

### Weather Forecast

```
https://api.open-meteo.com/v1/forecast
```

---

## 📌 Ejemplo de uso

```javascript
fetchWeather("Guadalajara");
```

Salida esperada:

```
Guadalajara, Mexico
🌡️ 25 °C
💨 10 km/h
```

---

## ⚠️ Manejo de errores

* Ciudad vacía → mensaje al usuario
* Ciudad no encontrada → error controlado
* Problemas de red → mensaje de fallo

---

## 🚀 Mejoras futuras

* Mostrar temperatura en °F
* Iconos según clima
* Geolocalización automática
* Guardar última búsqueda
* UI tipo app móvil

---

## 👩‍💻 Autor

Proyecto desarrollado como práctica de consumo de APIs y desarrollo frontend.

---

## 📄 Licencia

Uso libre para fines educativos.

