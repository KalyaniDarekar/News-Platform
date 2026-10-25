import React, { useEffect } from 'react';
import {
  X, RefreshCw, MapPin, Sun, CloudSun, Cloud, CloudRain,
  CloudLightning, CloudFog, CloudSnow, Wind, Droplets,
  Thermometer, Compass, Sunrise, Sunset, Activity, ShieldAlert,
  Gauge, Info, Calendar, Sparkles
} from 'lucide-react';

// Dynamic weather icon selector
export function getWeatherIcon(weatherCode, isDay = true, size = 20, className = '') {
  const code = Number(weatherCode) || 0;
  if (code === 0 || code === 1) {
    return isDay ? <Sun size={size} className={className} style={{ color: '#f59e0b' }} />
                 : <CloudSun size={size} className={className} style={{ color: '#93c5fd' }} />;
  }
  if (code === 2) {
    return <CloudSun size={size} className={className} style={{ color: '#f59e0b' }} />;
  }
  if (code === 3) {
    return <Cloud size={size} className={className} style={{ color: '#94a3b8' }} />;
  }
  if (code === 45 || code === 48) {
    return <CloudFog size={size} className={className} style={{ color: '#cbd5e1' }} />;
  }
  if (code >= 51 && code <= 67) {
    return <CloudRain size={size} className={className} style={{ color: '#0284c7' }} />;
  }
  if (code >= 71 && code <= 77) {
    return <CloudSnow size={size} className={className} style={{ color: '#38bdf8' }} />;
  }
  if (code >= 80 && code <= 82) {
    return <CloudRain size={size} className={className} style={{ color: '#2563eb' }} />;
  }
  if (code >= 95) {
    return <CloudLightning size={size} className={className} style={{ color: '#dc2626' }} />;
  }
  return <CloudSun size={size} className={className} style={{ color: '#f59e0b' }} />;
}

export default function WeatherHubModal({ isOpen, onClose, weatherData, onRefresh, isRefreshing }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !weatherData) return null;

  const aqiNum = weatherData.aqiNum || Number(weatherData.aqi) || 85;
  const aqiPercent = Math.min(Math.round((aqiNum / 300) * 100), 100);

  return (
    <div 
      className="weather-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 15, 29, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="weather-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="weather-modal-title"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
              animation: 'pulse 2s infinite'
            }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} style={{ color: '#059669' }} />
                <h2 id="weather-modal-title" style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  margin: 0,
                  color: '#0f172a',
                  letterSpacing: '-0.01em'
                }}>
                  {weatherData.city}, {weatherData.region || weatherData.country}
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '0.12rem 0.45rem',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Live Location
                </span>
              </div>
              <p style={{
                margin: '0.15rem 0 0',
                fontSize: '0.74rem',
                color: '#64748b',
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap'
              }}>
                <span>Detected via: <strong>{weatherData.source || 'Device Geolocation'}</strong></span>
                {weatherData.latitude && (
                  <span>({weatherData.latitude.toFixed(2)}°N, {weatherData.longitude.toFixed(2)}°E)</span>
                )}
                {weatherData.lastUpdated && (
                  <span>• Updated: {weatherData.lastUpdated}</span>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh live location and weather"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                cursor: isRefreshing ? 'wait' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close weather modal"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Hero Weather Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '-20px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0) 70%)',
              pointerEvents: 'none'
            }} />

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <Sparkles size={13} style={{ color: '#fbbf24' }} />
                <span>REAL-TIME METEOROLOGICAL OBSERVATION</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <h3 style={{
                  fontSize: '3.6rem',
                  fontWeight: 900,
                  margin: 0,
                  lineHeight: 1,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '-0.03em'
                }}>
                  {weatherData.temp}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {weatherData.condition}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Feels like {weatherData.apparentTemp || weatherData.temp}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <span><strong>High:</strong> {weatherData.tempMaxToday}</span>
                <span>•</span>
                <span><strong>Low:</strong> {weatherData.tempMinToday}</span>
                <span>•</span>
                <span><strong>Rain Chance:</strong> {weatherData.rainChanceToday || '0%'}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.07)',
              padding: '1.25rem 1.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: '150px'
            }}>
              <div style={{ transform: 'scale(1.8)', margin: '0.5rem 0' }}>
                {getWeatherIcon(weatherData.weatherCode, weatherData.isDay, 24)}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.5rem' }}>
                {weatherData.isDay ? 'Daytime' : 'Nighttime'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                {weatherData.city}
              </span>
            </div>
          </div>

          {/* Key Atmospheric Metrics Grid */}
          <div>
            <h4 style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#475569',
              margin: '0 0 0.85rem'
            }}>
              Current Atmospheric Indicators
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.85rem'
            }}>
              {/* Humidity */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span>Relative Humidity</span>
                  <Droplets size={15} style={{ color: '#0284c7' }} />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {weatherData.humidity}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {weatherData.humidityNum > 65 ? 'High / Humid' : weatherData.humidityNum < 30 ? 'Dry / Low' : 'Optimal Comfort'}
                </div>
              </div>

              {/* Wind Speed & Direction */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span>Wind Speed</span>
                  <Wind size={15} style={{ color: '#059669' }} />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {weatherData.windSpeed}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Direction: <strong>{weatherData.windDirection}</strong> ({weatherData.windDeg || 0}°)
                </div>
              </div>

              {/* UV Index */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span>UV Index</span>
                  <Sun size={15} style={{ color: weatherData.uvColor || '#f59e0b' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    {weatherData.uvIndex}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: weatherData.uvColor,
                    backgroundColor: '#fff',
                    padding: '0.05rem 0.35rem',
                    borderRadius: '4px',
                    border: `1px solid ${weatherData.uvColor}`
                  }}>
                    {weatherData.uvLevel}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {weatherData.uvAdvice}
                </div>
              </div>

              {/* Barometric Pressure */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span>Barometric Pressure</span>
                  <Gauge size={15} style={{ color: '#6366f1' }} />
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {weatherData.pressure}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Precipitation: <strong>{weatherData.precipitation}</strong>
                </div>
              </div>

              {/* Sunrise & Sunset */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                  <span>Solar Ephemeris</span>
                  <Sunrise size={15} style={{ color: '#ea580c' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.15rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                    🌅 Sunrise: <strong>{weatherData.sunriseToday}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                    🌇 Sunset: <strong>{weatherData.sunsetToday}</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Air Quality Index (AQI) Station */}
          <div style={{
            backgroundColor: weatherData.aqiBg || '#f8fafc',
            border: `1px solid ${weatherData.aqiBorder || '#e2e8f0'}`,
            borderRadius: '10px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: weatherData.aqiColor || '#059669' }} />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Hyperlocal Air Quality Index (US AQI)
                </h4>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#ffffff',
                backgroundColor: weatherData.aqiColor || '#059669',
                padding: '0.2rem 0.65rem',
                borderRadius: '4px',
                letterSpacing: '0.02em'
              }}>
                AQI {weatherData.aqi} • {weatherData.aqiLabel}
              </span>
            </div>

            {/* Visual AQI Gauge Bar */}
            <div style={{ margin: '0.6rem 0' }}>
              <div style={{
                height: '8px',
                borderRadius: '999px',
                background: 'linear-gradient(to right, #16a34a 0%, #d97706 25%, #ea580c 50%, #dc2626 75%, #7c3aed 100%)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${aqiPercent}%`,
                  top: '-4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: `3px solid ${weatherData.aqiColor || '#0f172a'}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transform: 'translateX(-50%)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                <span>0 Good</span>
                <span>50 Moderate</span>
                <span>100 Unhealthy Sensitive</span>
                <span>150 Unhealthy</span>
                <span>200+ Hazardous</span>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#334155', margin: '0.75rem 0 0.85rem', lineHeight: 1.45 }}>
              <strong>Health Advisory:</strong> {weatherData.aqiAdvisory}
            </p>

            {/* Pollutant Chips */}
            {weatherData.pollutants && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  PM2.5: <strong>{weatherData.pollutants.pm2_5} µg/m³</strong>
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  PM10: <strong>{weatherData.pollutants.pm10} µg/m³</strong>
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  Ozone (O₃): <strong>{weatherData.pollutants.ozone} µg/m³</strong>
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  NO₂: <strong>{weatherData.pollutants.no2} µg/m³</strong>
                </span>
              </div>
            )}
          </div>

          {/* 24-Hour Hourly Timeline */}
          {weatherData.hourly && weatherData.hourly.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#475569',
                margin: '0 0 0.85rem'
              }}>
                24-Hour Hyperlocal Hourly Forecast
              </h4>

              <div style={{
                display: 'flex',
                gap: '0.65rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'thin'
              }}>
                {weatherData.hourly.map((hour, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: '0 0 76px',
                      backgroundColor: idx === 0 ? '#eff6ff' : '#f8fafc',
                      border: idx === 0 ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.65rem 0.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: idx === 0 ? 800 : 600, color: idx === 0 ? '#1d4ed8' : '#64748b' }}>
                      {hour.label}
                    </span>
                    <div style={{ margin: '0.15rem 0' }}>
                      {getWeatherIcon(hour.weatherCode, hour.isDay, 18)}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                      {hour.temp}
                    </span>
                    {hour.rainProb > 0 ? (
                      <span style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 700 }}>
                        💧{hour.rainProb}%
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                        {hour.condition.split(' ')[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Extended Forecast */}
          {weatherData.daily && weatherData.daily.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#475569',
                margin: '0 0 0.85rem'
              }}>
                7-Day Local Extended Forecast
              </h4>

              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                {weatherData.daily.map((day, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 1rem',
                      borderBottom: idx < weatherData.daily.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: idx === 0 ? '#f8fafc' : 'transparent',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ width: '85px', fontWeight: idx === 0 ? 800 : 600, color: idx === 0 ? '#0f172a' : '#334155' }}>
                      {day.dayName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '160px' }}>
                      {getWeatherIcon(day.weatherCode, true, 16)}
                      <span style={{ fontSize: '0.78rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {day.condition}
                      </span>
                    </div>

                    <div style={{ width: '65px', textAlign: 'center', fontSize: '0.72rem', color: day.rainProb > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>
                      {day.rainProb > 0 ? `💧 ${day.rainProb}%` : '—'}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', width: '120px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{day.tempMin}°</span>
                      <div style={{
                        width: '50px',
                        height: '4px',
                        borderRadius: '999px',
                        background: 'linear-gradient(to right, #38bdf8, #f59e0b)'
                      }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{day.tempMax}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.9rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748b',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px'
        }}>
          <span>Continuous meteorological updates provided via Open-Meteo & WMO Atmospheric Network</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.4rem 1rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '5px',
              cursor: 'pointer',
              border: 'none',
              fontSize: '0.75rem'
            }}
          >
            Close Weather Hub
          </button>
        </div>

      </div>
    </div>
  );
}
