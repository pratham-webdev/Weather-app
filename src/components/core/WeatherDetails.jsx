import { memo } from "react";
import { convertTemp, convertWind, convertVisibility, MOON_PHASES } from "../../utils.js";
import AQIDetails from "../shared/AQIDetails.jsx";
import WeatherIcon from "./WeatherIcon.jsx";

const MoonPhaseCard = memo(function MoonPhaseCard({ moonData }) {
  if (!moonData || moonData.moon_phase == null) return null;
  const phaseVal = Math.round(moonData.moon_phase * 7);
  const phase = MOON_PHASES[phaseVal] || { name: "Unknown", emoji: "🌑" };
  const rise = moonData.moonrise || "--";
  const set = moonData.moonset || "--";
  const fmt = t => t === "--" ? "--" : t.split("T")[1]?.split(":").slice(0, 2).join(":") || "--";
  return (
    <div className="glass-card detail-card detail-moon">
      <div className="detail-icon">{phase.emoji}</div>
      <div className="detail-label">Moon Phase</div>
      <div className="detail-value" style={{ fontSize: "1rem" }}>{phase.name}</div>
      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px" }}>
        ↑ {fmt(rise)} ↓ {fmt(set)}
      </div>
    </div>
  );
});

const WeatherDetails = memo(function WeatherDetails({ data, units, moonData }) {
  const sunrise = data.daily.sunrise[0] ? data.daily.sunrise[0].split("T")[1]?.split(":").slice(0, 2).join(":") : "--";
  const sunset = data.daily.sunset[0] ? data.daily.sunset[0].split("T")[1]?.split(":").slice(0, 2).join(":") : "--";
  const fmtTime = (iso) => {
    if (!iso) return "--";
    const parts = iso.split("T")[1]?.split(":") || [];
    const h = parseInt(parts[0], 10);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${h % 12 || 12}:${parts[1] || "00"} ${ampm}`;
  };

  const aqi = data.aqi;
  let aqiLabel = "Good";
  if (aqi !== null && aqi !== undefined) {
    if (aqi <= 50) aqiLabel = "Good";
    else if (aqi <= 100) aqiLabel = "Moderate";
    else if (aqi <= 150) aqiLabel = "Unhealthy (Sensitive)";
    else if (aqi <= 200) aqiLabel = "Unhealthy";
    else if (aqi <= 300) aqiLabel = "Very Unhealthy";
    else aqiLabel = "Hazardous";
  }

  const uvVal = Math.round(data.daily.uv_index_max[0] * 10) / 10;
  let uvLevel = "Low";
  let uvColor = "#22c55e";
  if (uvVal >= 11) { uvLevel = "Extreme"; uvColor = "#7f1d1d"; }
  else if (uvVal >= 8) { uvLevel = "Very High"; uvColor = "#a855f7"; }
  else if (uvVal >= 6) { uvLevel = "High"; uvColor = "#f97316"; }
  else if (uvVal >= 3) { uvLevel = "Moderate"; uvColor = "#eab308"; }

  const windDeg = data.current.wind_direction_10m;
  const windSpeed = convertWind(data.current.wind_speed_10m, units.wind);
  const windUnit = units.wind === "mph" ? "mph" : "km/h";
  const alerts = data.alerts;
  const hasOfficialAlerts = alerts && alerts.length > 0;

  return (
    <>
      {hasOfficialAlerts && (
        <div className="official-alerts fade-in">
          {alerts.map((a, i) => (
            <div key={i} className="official-alert glass-card">
              <div className="official-alert-title">⚠️ {a.event || "Weather Alert"}</div>
              <div className="official-alert-desc">{a.description || "Official weather advisory in effect."}</div>
              {a.expires && <div className="official-alert-expires">Expires: {a.expires}</div>}
              {a.sender && <div className="official-alert-sender">Source: {a.sender}</div>}
            </div>
          ))}
        </div>
      )}
      <div className="details-grid">
        <div className="glass-card detail-card">
          <div className="detail-icon">💧</div>
          <div className="detail-label">Humidity</div>
          <div className="detail-value">{data.current.relative_humidity_2m}<span className="detail-unit">%</span></div>
        </div>
        <div className="glass-card detail-card detail-wind">
          <div className="detail-label">Wind</div>
          <svg viewBox="0 0 60 60" className="compass-svg">
            <circle cx="30" cy="30" r="28" fill="none" stroke="var(--border)" strokeWidth="1" />
            <text x="30" y="8" textAnchor="middle" fontSize="6" fill="var(--text-muted)" fontWeight="600">N</text>
            <text x="54" y="32" textAnchor="middle" fontSize="6" fill="var(--text-muted)">E</text>
            <text x="30" y="56" textAnchor="middle" fontSize="6" fill="var(--text-muted)">S</text>
            <text x="6" y="32" textAnchor="middle" fontSize="6" fill="var(--text-muted)">W</text>
            <line x1="30" y1="30" x2="30" y2="8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${windDeg}, 30, 30)`} />
            <circle cx="30" cy="30" r="3" fill="var(--accent)" />
          </svg>
          <div className="detail-value">{windSpeed}<span className="detail-unit"> {windUnit}</span></div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Gusts {convertWind(data.current.wind_gusts_10m, units.wind)} {windUnit}</div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">🌡️</div>
          <div className="detail-label">Pressure</div>
          <div className="detail-value">{Math.round(data.current.surface_pressure)}<span className="detail-unit"> hPa</span></div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">🤔</div>
          <div className="detail-label">Feels Like</div>
          <div className="detail-value">{convertTemp(data.current.apparent_temperature, units.temp)}<span className="detail-unit">°{units.temp}</span></div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">💦</div>
          <div className="detail-label">Dew Point</div>
          <div className="detail-value">{convertTemp(data.current.dew_point_2m, units.temp)}<span className="detail-unit">°{units.temp}</span></div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">👁️</div>
          <div className="detail-label">Visibility</div>
          <div className="detail-value">{convertVisibility(data.current.visibility)}</div>
        </div>
        <div className="glass-card detail-card detail-uv">
          <div className="detail-icon">☀️</div>
          <div className="detail-label">UV Index</div>
          <div className="detail-value">{uvVal}<span className="detail-unit" style={{ color: uvColor }}> ({uvLevel})</span></div>
          <div className="uv-scale">
            <div className="uv-scale-track">
              <div className="uv-scale-fill" style={{ width: `${Math.min(uvVal / 11 * 100, 100)}%`, background: uvColor }} />
            </div>
            <div className="uv-scale-labels">
              <span>0</span><span>3</span><span>6</span><span>8</span><span>11+</span>
            </div>
          </div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">🌅</div>
          <div className="detail-label">Sunrise</div>
          <div className="detail-value">{fmtTime(data.daily.sunrise[0])}</div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">🌇</div>
          <div className="detail-label">Sunset</div>
          <div className="detail-value">{fmtTime(data.daily.sunset[0])}</div>
        </div>
        <div className="glass-card detail-card">
          <div className="detail-icon">🫁</div>
          <div className="detail-label">AQI</div>
          <div className="detail-value">{aqi !== null && aqi !== undefined ? aqi : "N/A"}<span className="detail-unit"> ({aqiLabel})</span></div>
        </div>
        <MoonPhaseCard moonData={moonData} />
      </div>
      <AQIDetails aqi={aqi} aqiDetails={data.aqiDetails} aqiLabel={aqiLabel} />
    </>
  );
});

export default WeatherDetails;
