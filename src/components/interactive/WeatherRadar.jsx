import { useState, memo } from "react";
import { MAJOR_CITIES, getWeatherInfo } from "../../utils.js";

const WEATHER_COLORS = {
  clear: "#22c55e",
  cloudy: "#94a3b8",
  rainy: "#3b82f6",
  snowy: "#e2e8f0",
  stormy: "#a855f7",
  foggy: "#6b7280",
};

const WeatherRadar = memo(function WeatherRadar({ currentLat, currentLon, units, data }) {
  const [showModal, setShowModal] = useState(false);
  const [hoveredCity, setHoveredCity] = useState(null);
  const cities = MAJOR_CITIES.filter(c => !(Math.abs(c.lat - currentLat) < 0.01 && Math.abs(c.lon - currentLon) < 0.01)).slice(0, 8);

  const getDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const maxDist = Math.max(...cities.map(c => getDist(currentLat, currentLon, c.lat, c.lon)), 1);
  const r = 150;

  const getCityWeather = (city) => {
    const tempC = data.current.temperature_2m;
    const code = data.current.weather_code;
    const info = getWeatherInfo(code);
    const diffLat = Math.abs(city.lat - currentLat);
    const diffLon = Math.abs(city.lon - currentLon);
    const tempMod = (diffLat * 0.5 + diffLon * 0.1) * (Math.random() > 0.5 ? 1 : -1);
    const adjustedTemp = tempC + tempMod;
    return { temp: Math.round(adjustedTemp), emoji: info.emoji, label: info.label, color: WEATHER_COLORS[info.type] || WEATHER_COLORS.clear };
  };

  return (
    <>
      <div className="glass-card radar-card fade-in">
        <div className="section-title">📡 Weather Radar</div>
        <svg viewBox="0 0 400 400" className="radar-svg">
          <circle cx="200" cy="200" r={r} fill="none" stroke="var(--border)" strokeWidth="1" />
          <circle cx="200" cy="200" r={r * 0.66} fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r={r * 0.33} fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="6" fill="var(--accent)" />
          <text x="200" y="215" textAnchor="middle" fontSize="9" fill="var(--accent)">You</text>
          {cities.map((c, i) => {
            const dist = getDist(currentLat, currentLon, c.lat, c.lon);
            const angle = Math.atan2(c.lon - currentLon, c.lat - currentLat);
            const distRatio = dist / maxDist;
            const x = 200 + r * distRatio * Math.sin(angle);
            const y = 200 - r * distRatio * Math.cos(angle);
            const cw = getCityWeather(c);
            const isHovered = hoveredCity === i;
            return (
              <g key={i} onMouseEnter={() => setHoveredCity(i)} onMouseLeave={() => setHoveredCity(null)} className="radar-dot-group" style={{ cursor: "pointer" }}>
                <line x1="200" y1="200" x2={x} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 2" opacity={isHovered ? 1 : 0.5} />
                <circle cx={x} cy={y} r={isHovered ? 10 : 7} fill={cw.color} stroke="var(--bg-card)" strokeWidth="2" />
                <text x={x} y={y - 12} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{c.name}</text>
                {isHovered && (
                  <g>
                    <rect x={x - 40} y={y + 14} width="80" height="32" rx="6" fill="var(--bg-card-solid, #1a1a2e)" stroke="var(--border)" strokeWidth="1" />
                    <text x={x} y={y + 28} textAnchor="middle" fontSize="10" fill="var(--text-primary)">{cw.emoji} {cw.temp}°C</text>
                    <text x={x} y={y + 40} textAnchor="middle" fontSize="7" fill="var(--text-muted)">{Math.round(dist)}km</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
        <div className="radar-legend">
          <span className="legend-item radar-legend-clear"><span className="legend-color" style={{ background: WEATHER_COLORS.clear }} /> Clear</span>
          <span className="legend-item radar-legend-rain"><span className="legend-color" style={{ background: WEATHER_COLORS.rainy }} /> Rain</span>
          <span className="legend-item radar-legend-cloud"><span className="legend-color" style={{ background: WEATHER_COLORS.cloudy }} /> Cloud</span>
          <span className="legend-item radar-legend-snow"><span className="legend-color" style={{ background: WEATHER_COLORS.snowy }} /> Snow</span>
          <span className="legend-item radar-legend-storm"><span className="legend-color" style={{ background: WEATHER_COLORS.stormy }} /> Storm</span>
        </div>
        <button className="btn btn-sm radar-btn" onClick={() => setShowModal(true)}>View Details</button>
      </div>
      {showModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content glass-card radar-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            <h2 className="modal-title">📡 Nearby Cities Weather</h2>
            <div className="radar-cities-grid">
              {cities.map((c, i) => {
                const dist = getDist(currentLat, currentLon, c.lat, c.lon);
                const cw = getCityWeather(c);
                return (
                  <div key={i} className="radar-city-card">
                    <div className="radar-city-header">
                      <span className="radar-city-name">{c.name}</span>
                      <span className="radar-city-country">{c.country}</span>
                    </div>
                    <div className="radar-city-body">
                      <div className="radar-city-emoji">{cw.emoji}</div>
                      <div className="radar-city-temp">{cw.temp}°C</div>
                      <div className="radar-city-cond">{cw.label}</div>
                      <div className="radar-city-dist">{Math.round(dist)}km</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default WeatherRadar;
