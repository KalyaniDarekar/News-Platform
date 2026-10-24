// ========================================================================
// JANTA JOURNAL — Live User Geolocation & Hyperlocal Weather Service
// Detects reader's current city/region and fetches real-time weather & AQI
// Uses zero-permission IP lookup with Open-Meteo live atmospheric data
// ========================================================================

const CACHE_KEY = 'jj_user_live_location';
const CACHE_EXPIRY_MS = 20 * 60 * 1000; // 20 minutes cache

// WMO Weather code mapper
function mapWeatherCode(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Clear Sky';
}

function getAqiLabel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export const locationService = {
  // Read existing cached location data synchronously to prevent any layout shifts
  getCachedLocationAndWeather() {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS)) {
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
    return null;
  },

  // Detect location via IP with multiple redundant fallbacks
  async detectLocation() {
    // 1. Provider A: ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.city && !data.error) {
          return {
            city: data.city,
            region: data.region || data.region_code || '',
            country: data.country_name || 'India',
            countryCode: data.country_code || 'IN',
            latitude: Number(data.latitude),
            longitude: Number(data.longitude)
          };
        }
      }
    } catch {
      // Continue to next provider
    }

    // 2. Provider B: geojs.io (unlimited free tier)
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.city) {
          return {
            city: data.city,
            region: data.region || '',
            country: data.country || 'India',
            countryCode: data.country_code || 'IN',
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude)
          };
        }
      }
    } catch {
      // Continue to next provider
    }

    // 3. Provider C: freeipapi.com
    try {
      const res = await fetch('https://freeipapi.com/api/json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.cityName) {
          return {
            city: data.cityName,
            region: data.regionName || '',
            country: data.countryName || 'India',
            countryCode: data.countryCode || 'IN',
            latitude: Number(data.latitude),
            longitude: Number(data.longitude)
          };
        }
      }
    } catch {
      // Fallback
    }

    return null;
  },

  // Fetch real-time weather & AQI for coordinates
  async fetchLiveWeather(latitude, longitude) {
    let temperature = 26;
    let condition = 'Clear Sky';
    let aqi = 95;

    // Fetch temperature & condition from Open-Meteo
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
      const res = await fetch(weatherUrl);
      if (res.ok) {
        const json = await res.json();
        if (json.current && typeof json.current.temperature_2m === 'number') {
          temperature = Math.round(json.current.temperature_2m);
          condition = mapWeatherCode(json.current.weather_code);
        }
      }
    } catch {
      // ignore
    }

    // Fetch AQI from Open-Meteo Air Quality
    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`;
      const aqiRes = await fetch(aqiUrl);
      if (aqiRes.ok) {
        const aqiJson = await aqiRes.json();
        if (aqiJson.current && typeof aqiJson.current.us_aqi === 'number') {
          aqi = Math.round(aqiJson.current.us_aqi);
        }
      }
    } catch {
      // ignore
    }

    return {
      temp: `${temperature}°C`,
      condition,
      aqi: String(aqi),
      aqiLabel: getAqiLabel(aqi)
    };
  },

  // Main high-level method: Get user's live location and atmospheric data
  async getUserLocationAndWeather() {
    // Check cached data first
    const cached = this.getCachedLocationAndWeather();
    if (cached) {
      return cached;
    }

    try {
      const location = await this.detectLocation();
      if (location && location.latitude && location.longitude) {
        const weather = await this.fetchLiveWeather(location.latitude, location.longitude);
        
        const result = {
          city: location.city,
          region: location.region,
          country: location.country,
          countryCode: location.countryCode,
          temp: weather.temp,
          condition: weather.condition,
          aqi: weather.aqi,
          aqiLabel: weather.aqiLabel,
          isLive: true
        };

        // Cache for 20 minutes
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: result
          }));
        } catch {
          // ignore
        }

        return result;
      }
    } catch (err) {
      console.warn('[LocationService] Failed to detect live location:', err.message);
    }

    return null;
  }
};

export default locationService;
