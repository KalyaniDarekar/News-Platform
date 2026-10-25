import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShieldCheck, MapPin } from 'lucide-react';
import locationService from '../../services/locationService';
import WeatherHubModal from './WeatherHubModal';

export default function TopInfoBar() {
  const [currentDate, setCurrentDate] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);

  // Load weather and live location
  const loadLiveLocationAndWeather = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);

    try {
      // 1. If not forcing refresh, try cached version first for instant display
      if (!forceRefresh) {
        const cached = locationService.getCachedLocationAndWeather();
        if (cached) {
          setWeatherData(cached);
        }
      }

      // 2. Fetch live data
      const liveData = await locationService.getUserLocationAndWeather(forceRefresh);
      if (liveData) {
        setWeatherData(liveData);
      }
    } catch (err) {
      console.warn('[TopInfoBar] Failed to load live location/weather:', err);
    } finally {
      if (forceRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Current date formatted in editorial timezone (IST)
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);
    setCurrentDate(formatted);

    loadLiveLocationAndWeather(false);
  }, [loadLiveLocationAndWeather]);

  return (
    <>
      <div className="top-info-bar">
        <div className="container-editorial">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem',
            padding: '0.2rem 0'
          }}>
            
            {/* Left Block: Date & Clean Temperature + AQI Block */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap'
            }}>
              {/* Date */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                <Calendar size={13} style={{ color: 'var(--color-ink-500)', flexShrink: 0 }} />
                <span>{currentDate}</span>
              </span>

              {/* Temperature & AQI Block */}
              {weatherData && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsWeatherModalOpen(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsWeatherModalOpen(true); }}
                  title={weatherData.region ? `${weatherData.city}, ${weatherData.region} • Click to view full forecast & AQI details` : `${weatherData.city} • Click to view full forecast & AQI details`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.74rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }}
                >
                  <MapPin size={12} style={{ color: 'var(--color-ink-600)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: 'var(--color-ink-800)' }}>
                    {weatherData.city} {weatherData.temp}
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    backgroundColor: weatherData.aqiBg || '#fef3c7', 
                    color: weatherData.aqiColor || '#92400e', 
                    padding: '0.1rem 0.35rem', 
                    borderRadius: '2px', 
                    fontWeight: 700 
                  }}>
                    AQI {weatherData.aqi}
                  </span>
                </div>
              )}
            </div>

            {/* Right Block: Action Links */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              {/* Direct Link to Newsroom Admin CMS */}
              <Link 
                to="/admin" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.25rem', 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: '#1e40af', 
                  backgroundColor: '#eff6ff', 
                  padding: '0.15rem 0.45rem', 
                  borderRadius: '3px',
                  border: '1px solid #bfdbfe',
                  textDecoration: 'none'
                }}
              >
                <ShieldCheck size={12} /> Newsroom CMS
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Comprehensive Weather Hub & Forecast Modal */}
      <WeatherHubModal
        isOpen={isWeatherModalOpen}
        onClose={() => setIsWeatherModalOpen(false)}
        weatherData={weatherData}
        onRefresh={() => loadLiveLocationAndWeather(true)}
        isRefreshing={isRefreshing}
      />
    </>
  );
}
