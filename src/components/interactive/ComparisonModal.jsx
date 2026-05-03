import { useState, useEffect, memo } from "react";
import { convertTemp, convertWind, getWeatherInfo } from "../../utils.js";

const ComparisonModal = memo(function ComparisonModal({ cities, currentCity, units, onClose }) {
  const [cityData, setCityData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const results = {};
      await Promise.all(cities.map(async (city) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=1`
          );
          const data = await res.json();
          results[city.name] = data;
        } catch { results[city.name] = null; }
      }));
      setCityData(results);
      setLoading(false);
    };
    fetchAll();
  }, [cities]);

  const allCities = [currentCity, ...cities.filter(c => c.name !== currentCity?.name)].slice(0, 3);

  return (
    <div className="modal-overlay fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-label="City comparison">
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close comparison">✕</button>
        <h2 className="modal-title">🔍 City Comparison</h2>
        {loading ? (
          <div className="modal-loading">Loading comparison...</div>
        ) : (
          <div className="comparison-grid">
            {allCities.map((city, i) => {
              const d = cityData[city.name];
              const info = d ? getWeatherInfo(d.current.weather_code) : null;
              return (
                <div key={i} className="comparison-card">
                  <div className="comparison-city">{city.name}</div>
                  {d && info ? (
                    <>
                      <div className="comparison-emoji">{info.emoji}</div>
                      <div className="comparison-temp">{convertTemp(d.current.temperature_2m, units.temp)}°{units.temp}</div>
                      <div className="comparison-condition">{info.label}</div>
                      <div className="comparison-high-low">H: {convertTemp(d.daily.temperature_2m_max[0], units.temp)}° / L: {convertTemp(d.daily.temperature_2m_min[0], units.temp)}°</div>
                      <div className="comparison-wind">Wind: {convertWind(d.current.wind_speed_10m, units.wind)} {units.wind === "mph" ? "mph" : "km/h"}</div>
                    </>
                  ) : (
                    <div className="comparison-error">Failed to load</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default ComparisonModal;
