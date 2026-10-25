// ========================================================================
// JANTA JOURNAL — Live User Geolocation & Hyperlocal Weather Service
// Automatically detects reader's live location and fetches real-time atmospheric
// & air quality data from Open-Meteo. No dropdown or manual selection required.
// ========================================================================

const CACHE_KEY = 'jj_user_live_location_v2';
const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes cache

// WMO Weather code mapper
export function mapWeatherCode(code, isDay = 1) {
  switch (code) {
    case 0:
      return isDay ? 'Clear Sky' : 'Clear Night';
    case 1:
      return isDay ? 'Mainly Clear' : 'Mainly Clear';
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Foggy';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 56:
    case 57:
      return 'Freezing Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 66:
    case 67:
      return 'Freezing Rain';
    case 71:
    case 73:
    case 75:
    case 77:
      return 'Snow Fall';
    case 80:
    case 81:
    case 82:
      return 'Rain Showers';
    case 85:
    case 86:
      return 'Snow Showers';
    case 95:
      return 'Thunderstorm';
    case 96:
    case 99:
      return 'Thunderstorm with Hail';
    default:
      return 'Fair';
  }
}

// Convert wind angle to 16-point compass direction
export function getWindDirection(deg) {
  if (typeof deg !== 'number') return 'Variable';
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index] || 'N';
}

// AQI US standard ratings
export function getAqiDetails(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 50) {
    return {
      label: 'Good',
      color: '#16a34a',
      bg: '#dcfce7',
      border: '#86efac',
      advisory: 'Air quality is satisfactory and poses little or no risk to health.'
    };
  }
  if (val <= 100) {
    return {
      label: 'Moderate',
      color: '#d97706',
      bg: '#fef3c7',
      border: '#fde68a',
      advisory: 'Air quality is acceptable; sensitive individuals may experience minor symptoms.'
    };
  }
  if (val <= 150) {
    return {
      label: 'Unhealthy for Sensitive Groups',
      color: '#ea580c',
      bg: '#ffedd5',
      border: '#fed7aa',
      advisory: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.'
    };
  }
  if (val <= 200) {
    return {
      label: 'Unhealthy',
      color: '#dc2626',
      bg: '#fee2e2',
      border: '#fca5a5',
      advisory: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.'
    };
  }
  if (val <= 300) {
    return {
      label: 'Very Unhealthy',
      color: '#7c3aed',
      bg: '#f3e8ff',
      border: '#d8b4fe',
      advisory: 'Health alert: The risk of health effects is increased for everyone.'
    };
  }
  return {
    label: 'Hazardous',
    color: '#831843',
    bg: '#fce7f3',
    border: '#f472b6',
    advisory: 'Health warnings of emergency conditions. The entire population is more likely to be affected.'
  };
}

// UV Index categorizer
export function getUvDetails(uv) {
  const val = Number(uv) || 0;
  if (val <= 2) {
    return { level: 'Low', color: '#16a34a', advice: 'No protection needed. Safe for outdoor activities.' };
  }
  if (val <= 5) {
    return { level: 'Moderate', color: '#d97706', advice: 'Wear sunglasses & sun protection during midday.' };
  }
  if (val <= 7) {
    return { level: 'High', color: '#ea580c', advice: 'Protection required: Hat, SPF 30+ sunscreen, seek shade.' };
  }
  if (val <= 10) {
    return { level: 'Very High', color: '#dc2626', advice: 'Extra protection needed. Avoid sun between 11 AM - 4 PM.' };
  }
  return { level: 'Extreme', color: '#7c3aed', advice: 'Take all precautions. Unprotected skin can burn quickly.' };
}

// Format ISO string to 12-hour time (e.g. 06:30 AM)
function formatIsoTime(isoStr) {
  if (!isoStr) return '--:--';
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
}

// Format ISO string to day of week
function formatWeekday(isoStr, isToday = false) {
  if (isToday) return 'Today';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString([], { weekday: 'short' });
  } catch {
    return 'Day';
  }
}

export const locationService = {
  // Read existing cached location & weather data synchronously
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

  // Try browser GPS geolocation first (fast 3.5s timeout)
  async getBrowserCoordinates() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 3500);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy || 100,
              source: 'GPS / Device'
            });
          }
        },
        () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            resolve(null);
          }
        },
        { enableHighAccuracy: false, timeout: 3200, maximumAge: 300000 }
      );
    });
  },

  // Reverse geocode lat/lon to City & State
  async reverseGeocode(latitude, longitude) {
    // 1. BigDataCloud free client geocoder
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || '';
        if (city) {
          return {
            city,
            region: data.principalSubdivision || '',
            country: data.countryName || 'India',
            countryCode: data.countryCode || 'IN'
          };
        }
      }
    } catch {
      // fallback
    }

    // 2. OSM Nominatim fallback
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.state_district || '';
        if (city) {
          return {
            city,
            region: addr.state || '',
            country: addr.country || 'India',
            countryCode: addr.country_code ? addr.country_code.toUpperCase() : 'IN'
          };
        }
      }
    } catch {
      // fallback
    }

    return null;
  },

  // IP Geolocation fallback providers
  async detectLocationViaIp() {
    // 1. Provider A: ipwho.is (fast, highly accurate, CORS friendly)
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.city) {
          return {
            city: data.city,
            region: data.region || '',
            country: data.country || 'India',
            countryCode: data.country_code || 'IN',
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            source: 'Network IP'
          };
        }
      }
    } catch {
      // next
    }

    // 2. Provider B: ipapi.co
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
            longitude: Number(data.longitude),
            source: 'Network IP'
          };
        }
      }
    } catch {
      // next
    }

    // 3. Provider C: geojs.io
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lon = parseFloat(data.longitude);
          const rev = await this.reverseGeocode(lat, lon);
          return {
            city: rev?.city || data.city || data.region || 'Local',
            region: rev?.region || data.region || '',
            country: rev?.country || data.country || 'India',
            countryCode: rev?.countryCode || data.country_code || 'IN',
            latitude: lat,
            longitude: lon,
            source: 'Network IP'
          };
        }
      }
    } catch {
      // next
    }

    // 4. Provider D: freeipapi.com
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
            longitude: Number(data.longitude),
            source: 'Network IP'
          };
        }
      }
    } catch {
      // fallback
    }

    return null;
  },

  // Detect live location prioritizing browser GPS, seamlessly falling back to IP
  async detectLiveLocation() {
    // Try GPS first
    try {
      const browserPos = await this.getBrowserCoordinates();
      if (browserPos && browserPos.latitude && browserPos.longitude) {
        const rev = await this.reverseGeocode(browserPos.latitude, browserPos.longitude);
        if (rev && rev.city) {
          return {
            city: rev.city,
            region: rev.region,
            country: rev.country,
            countryCode: rev.countryCode,
            latitude: browserPos.latitude,
            longitude: browserPos.longitude,
            source: 'Precise GPS'
          };
        }
      }
    } catch {
      // fallback
    }

    // Fall back to IP detection
    const ipLocation = await this.detectLocationViaIp();
    if (ipLocation) return ipLocation;

    // Default safe fallback if network is completely offline
    return {
      city: 'New Delhi',
      region: 'Delhi',
      country: 'India',
      countryCode: 'IN',
      latitude: 28.6139,
      longitude: 77.2090,
      source: 'Default National Bureau'
    };
  },

  // Fetch comprehensive real-time atmospheric, hourly, daily forecast & AQI
  async fetchLiveWeatherDetails(latitude, longitude) {
    const lat = Number(latitude).toFixed(4);
    const lon = Number(longitude).toFixed(4);

    let weatherData = null;
    let aqiData = null;

    // 1. Fetch current atmospheric + hourly + 7-day forecast from Open-Meteo
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
      const res = await fetch(weatherUrl);
      if (res.ok) {
        weatherData = await res.json();
      }
    } catch (err) {
      console.warn('[LocationService] Weather forecast fetch error:', err.message);
    }

    // 2. Fetch real-time Air Quality data
    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone&timezone=auto`;
      const aqiRes = await fetch(aqiUrl);
      if (aqiRes.ok) {
        aqiData = await aqiRes.json();
      }
    } catch (err) {
      console.warn('[LocationService] AQI fetch error:', err.message);
    }

    // Parse current conditions
    const curr = weatherData?.current || {};
    const daily = weatherData?.daily || {};
    const hourly = weatherData?.hourly || {};
    const aqiCurr = aqiData?.current || {};

    const tempNum = Math.round(curr.temperature_2m ?? 27);
    const apparentTempNum = Math.round(curr.apparent_temperature ?? tempNum);
    const weatherCode = curr.weather_code ?? 0;
    const isDay = curr.is_day ?? 1;
    const condition = mapWeatherCode(weatherCode, isDay);
    const humidity = Math.round(curr.relative_humidity_2m ?? 45);
    const windSpeed = Math.round(curr.wind_speed_10m ?? 8);
    const windDirDeg = curr.wind_direction_10m ?? 0;
    const windDirection = getWindDirection(windDirDeg);
    const pressure = Math.round(curr.surface_pressure ?? 1012);
    const precipitation = Number(curr.precipitation ?? 0).toFixed(1);

    // AQI details
    const usAqi = Math.round(aqiCurr.us_aqi ?? 85);
    const aqiMeta = getAqiDetails(usAqi);

    // UV Details
    const maxUvToday = daily.uv_index_max?.[0] ? Number(daily.uv_index_max[0]).toFixed(1) : '5.0';
    const uvMeta = getUvDetails(maxUvToday);

    // Today's extremes & astronomical times
    const tempMaxToday = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : tempNum + 2;
    const tempMinToday = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : tempNum - 5;
    const sunriseToday = formatIsoTime(daily.sunrise?.[0]);
    const sunsetToday = formatIsoTime(daily.sunset?.[0]);
    const rainChanceToday = daily.precipitation_probability_max?.[0] ?? 0;

    // 24-Hour hourly forecast
    const hourlyForecast = [];
    if (hourly.time && hourly.temperature_2m) {
      const nowIso = new Date().toISOString().slice(0, 13); // Match YYYY-MM-DDTHH
      let startIndex = hourly.time.findIndex(t => t.startsWith(nowIso));
      if (startIndex === -1) startIndex = 0;

      // Extract next 24 intervals
      for (let i = startIndex; i < startIndex + 24 && i < hourly.time.length; i++) {
        const timeStr = hourly.time[i];
        const d = new Date(timeStr);
        const hourLabel = i === startIndex ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
        const code = hourly.weather_code?.[i] ?? 0;
        const temp = Math.round(hourly.temperature_2m?.[i] ?? 0);
        const rainProb = hourly.precipitation_probability?.[i] ?? 0;
        const hourIsDay = d.getHours() >= 6 && d.getHours() < 19 ? 1 : 0;

        hourlyForecast.push({
          time: timeStr,
          label: hourLabel,
          temp: `${temp}°`,
          tempNum: temp,
          weatherCode: code,
          condition: mapWeatherCode(code, hourIsDay),
          isDay: hourIsDay,
          rainProb
        });
      }
    }

    // 7-Day daily forecast
    const dailyForecast = [];
    if (daily.time && daily.temperature_2m_max) {
      for (let i = 0; i < daily.time.length && i < 7; i++) {
        const dateStr = daily.time[i];
        const code = daily.weather_code?.[i] ?? 0;
        const max = Math.round(daily.temperature_2m_max[i]);
        const min = Math.round(daily.temperature_2m_min[i]);
        const rainProb = daily.precipitation_probability_max?.[i] ?? 0;

        dailyForecast.push({
          date: dateStr,
          dayName: formatWeekday(dateStr, i === 0),
          weatherCode: code,
          condition: mapWeatherCode(code, 1),
          tempMax: max,
          tempMin: min,
          rainProb
        });
      }
    }

    return {
      temp: `${tempNum}°C`,
      tempNum,
      apparentTemp: `${apparentTempNum}°C`,
      apparentTempNum,
      condition,
      weatherCode,
      isDay: Boolean(isDay),
      humidity: `${humidity}%`,
      humidityNum: humidity,
      windSpeed: `${windSpeed} km/h`,
      windSpeedNum: windSpeed,
      windDirection,
      windDeg: windDirDeg,
      pressure: `${pressure} hPa`,
      precipitation: `${precipitation} mm`,
      rainChanceToday: `${rainChanceToday}%`,
      tempMaxToday: `${tempMaxToday}°C`,
      tempMinToday: `${tempMinToday}°C`,
      sunriseToday,
      sunsetToday,
      uvIndex: maxUvToday,
      uvLevel: uvMeta.level,
      uvColor: uvMeta.color,
      uvAdvice: uvMeta.advice,
      aqi: String(usAqi),
      aqiNum: usAqi,
      aqiLabel: aqiMeta.label,
      aqiColor: aqiMeta.color,
      aqiBg: aqiMeta.bg,
      aqiBorder: aqiMeta.border,
      aqiAdvisory: aqiMeta.advisory,
      pollutants: {
        pm2_5: aqiCurr.pm2_5 ? Number(aqiCurr.pm2_5).toFixed(1) : '28.4',
        pm10: aqiCurr.pm10 ? Number(aqiCurr.pm10).toFixed(1) : '42.1',
        ozone: aqiCurr.ozone ? Number(aqiCurr.ozone).toFixed(1) : '54.0',
        no2: aqiCurr.nitrogen_dioxide ? Number(aqiCurr.nitrogen_dioxide).toFixed(1) : '12.5',
        co: aqiCurr.carbon_monoxide ? Number(aqiCurr.carbon_monoxide).toFixed(1) : '240'
      },
      hourly: hourlyForecast,
      daily: dailyForecast,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  // Main entrypoint: returns complete location & live weather suite
  async getUserLocationAndWeather(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = this.getCachedLocationAndWeather();
      if (cached) {
        return cached;
      }
    }

    try {
      const location = await this.detectLiveLocation();
      if (location && location.latitude && location.longitude) {
        const weather = await this.fetchLiveWeatherDetails(location.latitude, location.longitude);

        const result = {
          city: location.city,
          region: location.region,
          country: location.country,
          countryCode: location.countryCode,
          latitude: location.latitude,
          longitude: location.longitude,
          source: location.source,
          ...weather,
          isLive: true
        };

        // Save to cache
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
      console.warn('[LocationService] Failed to detect location & weather:', err);
    }

    return null;
  }
};

export default locationService;
