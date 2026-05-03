const { useState, useEffect, useRef, useCallback, useMemo } = React;

const MAJOR_CITIES = [
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
];

const WMO_CODES = {
  0: { label: "Clear Sky", type: "clear", emoji: "☀️" },
  1: { label: "Mainly Clear", type: "clear", emoji: "⛅" },
  2: { label: "Partly Cloudy", type: "cloudy", emoji: "⛅" },
  3: { label: "Overcast", type: "cloudy", emoji: "☁️" },
  45: { label: "Foggy", type: "foggy", emoji: "🌫️" },
  48: { label: "Rime Fog", type: "foggy", emoji: "🌫️" },
  51: { label: "Light Drizzle", type: "rainy", emoji: "🌦️" },
  53: { label: "Drizzle", type: "rainy", emoji: "🌧️" },
  55: { label: "Heavy Drizzle", type: "rainy", emoji: "🌧️" },
  61: { label: "Light Rain", type: "rainy", emoji: "🌧️" },
  63: { label: "Rain", type: "rainy", emoji: "🌧️" },
  65: { label: "Heavy Rain", type: "rainy", emoji: "🌧️" },
  71: { label: "Light Snow", type: "snowy", emoji: "❄️" },
  73: { label: "Snow", type: "snowy", emoji: "❄️" },
  75: { label: "Heavy Snow", type: "snowy", emoji: "❄️" },
  77: { label: "Snow Grains", type: "snowy", emoji: "❄️" },
  80: { label: "Rain Showers", type: "rainy", emoji: "🌦️" },
  81: { label: "Showers", type: "rainy", emoji: "🌦️" },
  82: { label: "Heavy Showers", type: "rainy", emoji: "🌧️" },
  85: { label: "Snow Showers", type: "snowy", emoji: "🌨️" },
  86: { label: "Heavy Snow Showers", type: "snowy", emoji: "🌨️" },
  95: { label: "Thunderstorm", type: "stormy", emoji: "⛈️" },
  96: { label: "Thunderstorm w/ Hail", type: "stormy", emoji: "⛈️" },
  99: { label: "Thunderstorm w/ Heavy Hail", type: "stormy", emoji: "⛈️" },
};

const GRADIENTS = {
  "clear-day": "var(--gradient-sunny)",
  "clear-night": "var(--gradient-night-clear)",
  "cloudy-day": "var(--gradient-cloudy)",
  "cloudy-night": "var(--gradient-night-cloudy)",
  "rainy-day": "var(--gradient-rainy)",
  "rainy-night": "var(--gradient-night-rainy)",
  "snowy-day": "var(--gradient-snowy)",
  "snowy-night": "var(--gradient-night-snowy)",
  "stormy-day": "var(--gradient-stormy)",
  "stormy-night": "var(--gradient-night-stormy)",
  "foggy-day": "var(--gradient-foggy)",
  "foggy-night": "var(--gradient-night-foggy)",
};

function getBgGradient(code, daytime) {
  const info = getWeatherInfo(code);
  const key = `${info.type}-${daytime ? "day" : "night"}`;
  return GRADIENTS[key] || (daytime ? "var(--gradient-cloudy)" : "var(--gradient-night-cloudy)");
}

function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: "Unknown", type: "cloudy", emoji: "🌥️" };
}

function convertTemp(c, unit) {
  if (unit === "F") return Math.round(c * 9 / 5 + 32);
  return Math.round(c);
}

function convertWind(kmh, unit) {
  if (unit === "mph") return Math.round(kmh * 0.621371);
  return Math.round(kmh);
}

function convertVisibility(meters) {
  if (meters == null || isNaN(meters)) return "N/A";
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  }
  return `${Math.round(meters)} m`;
}

function windDirection(degrees) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16];
}

function formatLocalTime(isoString) {
  const time = isoString.split("T")[1];
  if (!time) return "--";
  const parts = time.split(":");
  const h = parseInt(parts[0], 10);
  const m = parts[1] || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function formatLocalDate(isoString, options) {
  const datePart = isoString.split("T")[0];
  if (!datePart) return "--";
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", options);
}

function getCurrentTimeInTimezone(timezone) {
  if (!timezone) return { dateStr: "", timeStr: "" };
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit", hour12: true });
  const dateFmt = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", month: "long", day: "numeric" });
  return { dateStr: dateFmt.format(now), timeStr: fmt.format(now) };
}

function getCurrentHourInTimezone(timezone) {
  if (!timezone) return new Date().getHours();
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).formatToParts(now);
  return parseInt(parts.find(p => p.type === "hour").value, 10);
}

function isDaytime(data) {
  if (!data?.daily?.sunrise?.[0] || !data?.daily?.sunset?.[0]) return true;
  const sunriseStr = data.daily.sunrise[0];
  const sunsetStr = data.daily.sunset[0];
  const now = new Date();
  const sunriseTime = new Date(sunriseStr);
  const sunsetTime = new Date(sunsetStr);
  return now >= sunriseTime && now <= sunsetTime;
}

const WeatherIcon = React.memo(function WeatherIcon({ code, size = "medium" }) {
  const info = getWeatherInfo(code);
  const sizeMap = { small: "1.25rem", medium: "1.5rem", large: "2rem", hero: "3rem" };
  return <span style={{ fontSize: sizeMap[size] }}>{info.emoji}</span>;
});

const AnimatedIcon = React.memo(function AnimatedIcon({ type }) {
  if (type === "clear") {
    return (
      <div className="weather-icon-container">
        <div className="sun-rays">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)` }} />
          ))}
        </div>
        <div className="weather-icon-sun" />
      </div>
    );
  }
  if (type === "cloudy") {
    return (
      <div className="weather-icon-container">
        <div className="cloud-container">
          <div className="weather-icon-cloud" />
        </div>
      </div>
    );
  }
  if (type === "rainy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-rain" />
        <div className="raindrops">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="raindrop" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === "snowy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-snow" />
        <div className="snowflakes">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="snowflake" style={{ animationDelay: `${i * 0.3}s`, width: `${4 + i}px`, height: `${4 + i}px` }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === "stormy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-rain" />
        <div className="raindrops">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="raindrop" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="lightning" />
      </div>
    );
  }
  if (type === "foggy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-fog">
          <div className="fog-line" />
          <div className="fog-line" />
          <div className="fog-line" />
          <div className="fog-line" />
        </div>
      </div>
    );
  }
  return <div className="weather-icon-container"><div className="weather-icon-cloud" /></div>;
});

function LoadingState() {
  return (
    <div>
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton skeleton-card" />)}
      </div>
      <div style={{ display: "flex", gap: "12px", overflow: "hidden", marginBottom: "24px" }}>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton skeleton-hourly" />)}
      </div>
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton skeleton-daily" />)}
    </div>
  );
}

const CurrentWeather = React.memo(function CurrentWeather({ data, cityName, units, fetchTime, tick, toggleFavorite, isFavorite }) {
  const info = getWeatherInfo(data.current.weather_code);
  const { dateStr, timeStr } = getCurrentTimeInTimezone(data.timezone);
  const tzAbbr = data.timezone_abbreviation || "";
  const elapsed = Math.round((Date.now() - fetchTime) / 60000);
  const updatedLabel = elapsed < 1 ? "Just now" : elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m ago`;
  const daytime = isDaytime(data);
  const weatherClass = `${info.type}-${daytime ? "day" : "night"}`;

  return (
    <div className={`current-weather glass-card weather-${weatherClass}`}>
      <div className="current-content">
        <div className="current-left">
          <div className="current-city-header">
            <span>{cityName || "Your Location"}</span>
            <button className="favorite-btn" onClick={toggleFavorite} title={isFavorite ? "Remove from favorites" : "Add to favorites"} aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              {isFavorite ? "★" : "☆"}
            </button>
          </div>
          <div className="current-temp">{convertTemp(data.current.temperature_2m, units.temp)}°{units.temp}</div>
          <div className="current-condition">{info.emoji} {info.label}</div>
          <div className="current-high-low">H: {convertTemp(data.daily.temperature_2m_max[0], units.temp)}° L: {convertTemp(data.daily.temperature_2m_min[0], units.temp)}°</div>
          <div className="current-date">{dateStr} · {timeStr}{tzAbbr ? ` ${tzAbbr}` : ""}</div>
          <div className="current-updated">Updated {updatedLabel}</div>
        </div>
        <div className="current-center">
          <SunArc data={data} />
        </div>
        <div className="current-right">
          <AnimatedIcon type={info.type} />
        </div>
      </div>
    </div>
  );
});

const WeatherDetails = React.memo(function WeatherDetails({ data, units }) {
  const sunrise = data.daily.sunrise[0] ? formatLocalTime(data.daily.sunrise[0]) : "--";
  const sunset = data.daily.sunset[0] ? formatLocalTime(data.daily.sunset[0]) : "--";
  const aqi = data.aqi;
  let aqiLabel = "Good";
  let aqiColor = "#22c55e";
  if (aqi !== null && aqi !== undefined) {
    if (aqi <= 50) { aqiLabel = "Good"; aqiColor = "#22c55e"; }
    else if (aqi <= 100) { aqiLabel = "Moderate"; aqiColor = "#eab308"; }
    else if (aqi <= 150) { aqiLabel = "Unhealthy (Sensitive)"; aqiColor = "#f97316"; }
    else if (aqi <= 200) { aqiLabel = "Unhealthy"; aqiColor = "#ef4444"; }
    else if (aqi <= 300) { aqiLabel = "Very Unhealthy"; aqiColor = "#a855f7"; }
    else { aqiLabel = "Hazardous"; aqiColor = "#7f1d1d"; }
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

  const details = [
    { icon: "💧", label: "Humidity", value: data.current.relative_humidity_2m, unit: "%", type: "plain" },
    { type: "wind", speed: windSpeed, unit: windUnit, direction: windDeg, gusts: convertWind(data.current.wind_gusts_10m, units.wind) },
    { icon: "🌡️", label: "Pressure", value: Math.round(data.current.surface_pressure), unit: " hPa", type: "plain" },
    { icon: "🤔", label: "Feels Like", value: convertTemp(data.current.apparent_temperature, units.temp), unit: `°${units.temp}`, type: "plain" },
    { icon: "💦", label: "Dew Point", value: convertTemp(data.current.dew_point_2m, units.temp), unit: `°${units.temp}`, type: "plain" },
    { icon: "👁️", label: "Visibility", value: convertVisibility(data.current.visibility, units.temp), unit: "", type: "plain" },
    { type: "uv", value: uvVal, level: uvLevel, color: uvColor },
    { icon: "🌅", label: "Sunrise", value: sunrise, unit: "", type: "plain" },
    { icon: "🌇", label: "Sunset", value: sunset, unit: "", type: "plain" },
    { icon: "🫁", label: "AQI", value: aqi !== null && aqi !== undefined ? aqi : "N/A", unit: aqi !== null && aqi !== undefined ? ` (${aqiLabel})` : "", type: "plain" },
  ];

  return (
    <>
      <div className="details-grid">
        {details.map((d, i) => {
        if (d.type === "wind") {
          return (
            <div key={i} className="glass-card detail-card detail-wind" style={{ "--i": i }}>
              <div className="detail-label">Wind</div>
              <svg viewBox="0 0 60 60" className="compass-svg">
                <circle cx="30" cy="30" r="28" fill="none" stroke="var(--border)" strokeWidth="1" />
                <text x="30" y="8" textAnchor="middle" fontSize="6" fill="var(--text-muted)" fontWeight="600">N</text>
                <text x="54" y="32" textAnchor="middle" fontSize="6" fill="var(--text-muted)">E</text>
                <text x="30" y="56" textAnchor="middle" fontSize="6" fill="var(--text-muted)">S</text>
                <text x="6" y="32" textAnchor="middle" fontSize="6" fill="var(--text-muted)">W</text>
                <line x1="30" y1="30" x2="30" y2="8" stroke={d.color || "var(--accent)"} strokeWidth="2" strokeLinecap="round" transform={`rotate(${d.direction}, 30, 30)`} />
                <circle cx="30" cy="30" r="3" fill="var(--accent)" />
              </svg>
              <div className="detail-value">{d.speed}<span className="detail-unit"> {d.unit}</span></div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Gusts {d.gusts} {d.unit}</div>
            </div>
          );
        }
        if (d.type === "uv") {
          return (
            <div key={i} className="glass-card detail-card detail-uv" style={{ "--i": i }}>
              <div className="detail-icon">☀️</div>
              <div className="detail-label">UV Index</div>
              <div className="detail-value">{d.value}<span className="detail-unit" style={{ color: d.color }}> ({d.level})</span></div>
              <div className="uv-scale">
                <div className="uv-scale-track">
                  <div className="uv-scale-fill" style={{ width: `${Math.min(d.value / 11 * 100, 100)}%`, background: d.color }} />
                </div>
                <div className="uv-scale-labels">
                  <span>0</span><span>3</span><span>6</span><span>8</span><span>11+</span>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div key={i} className="glass-card detail-card" style={{ "--i": i }}>
            <div className="detail-icon">{d.icon}</div>
            <div className="detail-label">{d.label}</div>
            <div className="detail-value">{d.value}<span className="detail-unit">{d.unit}</span></div>
          </div>
        );
      })}
      </div>
      <AQIDetails aqi={aqi} aqiDetails={data.aqiDetails} aqiLabel={aqiLabel} />
    </>
  );
});

const HourlyForecast = React.memo(function HourlyForecast({ data, units, scrollRef }) {
  const currentHour = getCurrentHourInTimezone(data.timezone);
  const today = data.daily.time[0];

  const hours = [];
  const startIdx = data.hourly.time.findIndex(t => {
    const datePart = t.split("T")[0];
    const timePart = t.split("T")[1];
    if (!timePart) return false;
    return datePart === today && parseInt(timePart.split(":")[0], 10) === currentHour;
  });

  for (let i = 0; i < 24; i++) {
    const itemIdx = (startIdx >= 0 ? startIdx : 0) + i;
    if (itemIdx >= data.hourly.time.length) break;

    const time = data.hourly.time[itemIdx];
    const hourStr = i === 0 ? "Now" : formatLocalTime(time);
    hours.push({
      time: hourStr,
      temp: convertTemp(data.hourly.temperature_2m[itemIdx], units.temp),
      feelsLike: convertTemp(data.hourly.apparent_temperature[itemIdx], units.temp),
      code: data.hourly.weather_code[itemIdx],
      precip: data.hourly.precipitation_probability[itemIdx] != null ? data.hourly.precipitation_probability[itemIdx] : null,
    });
  }

  return (
    <div className="hourly-section">
      <div className="section-title">🕐 24-Hour Forecast</div>
      <div className="hourly-scroll" ref={scrollRef}>
        {hours.map((h, i) => (
          <div key={i} className="glass-card hourly-card" style={{ "--i": i }}>
            <div className="hourly-time">{h.time}</div>
            <div className="hourly-icon"><WeatherIcon code={h.code} /></div>
            <div className="hourly-temp">{h.temp}°</div>
            <div className="hourly-feels">Feels {h.feelsLike}°</div>
            {h.precip !== null && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{h.precip}%💧</div>}
          </div>
        ))}
      </div>
    </div>
  );
});

const SunArc = React.memo(function SunArc({ data }) {
  const sunriseStr = data.daily.sunrise[0];
  const sunsetStr = data.daily.sunset[0];
  if (!sunriseStr || !sunsetStr) return null;

  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);
  const now = new Date();
  const daytime = now >= sunrise && now <= sunset;

  const sunriseMinutes = sunrise.getHours() * 60 + sunrise.getMinutes();
  const sunsetMinutes = sunset.getHours() * 60 + sunset.getMinutes();
  const totalMinutes = sunsetMinutes - sunriseMinutes;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const progress = daytime ? Math.max(0, Math.min(1, (nowMinutes - sunriseMinutes) / totalMinutes)) : 0;

  const cx = 100;
  const cy = 90;
  const rx = 80;
  const ry = 70;
  const startX = cx - rx;
  const endX = cx + rx;
  const currentX = cx + rx * Math.cos(Math.PI * (1 - progress));
  const currentY = cy - ry * Math.sin(Math.PI * progress);

  return (
    <div className="sun-arc-inline">
      <div className="sun-arc-header">
        <span>🌅 {formatLocalTime(sunriseStr)}</span>
        <span className="sun-arc-label">{daytime ? "☀️ Sun is up" : "🌙 Night time"}</span>
        <span>🌇 {formatLocalTime(sunsetStr)}</span>
      </div>
      <svg viewBox="0 0 200 110" className="sun-arc-svg">
        <path d={`M ${startX} ${cy} A ${rx} ${ry} 0 0 1 ${endX} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
        {daytime && (
          <>
            <path d={`M ${startX} ${cy} A ${rx} ${ry} 0 0 1 ${currentX} ${currentY}`} fill="none" stroke="var(--accent)" strokeWidth="2" />
            <circle cx={currentX} cy={currentY} r="6" fill="#fbbf24" filter="url(#sunGlow)" />
            <circle cx={currentX} cy={currentY} r="4" fill="#fbbf24" />
          </>
        )}
        {!daytime && <circle cx={cx} cy={cy - 20} r="5" fill="var(--text-muted)" opacity="0.3" />}
        <defs>
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      {daytime && (
        <div className="sun-arc-progress">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{Math.round(progress * 100)}% of daylight elapsed</span>
        </div>
      )}
    </div>
  );
});

const AQIDetails = React.memo(function AQIDetails({ aqi, aqiDetails, aqiLabel }) {
  const [expanded, setExpanded] = React.useState(true);
  if (!aqiDetails) return null;

  const pollutants = [
    { name: "PM2.5", value: aqiDetails.pm25, unit: "μg/m³", max: 35 },
    { name: "PM10", value: aqiDetails.pm10, unit: "μg/m³", max: 50 },
    { name: "O₃", value: aqiDetails.ozone, unit: "μg/m³", max: 100 },
    { name: "NO₂", value: aqiDetails.no2, unit: "μg/m³", max: 40 },
  ].filter(p => p.value !== null);

  if (pollutants.length === 0) return null;

  return (
    <div className="aqi-expand">
      <button className="aqi-toggle" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
        {expanded ? "▲" : "▼"} Air Quality Breakdown
      </button>
      {expanded && (
        <div className="aqi-breakdown fade-in">
          {pollutants.map((p, i) => {
            const pct = Math.min((p.value / p.max) * 100, 100);
            const color = pct <= 50 ? "#22c55e" : pct <= 100 ? "#eab308" : "#ef4444";
            return (
              <div key={i} className="aqi-pollutant">
                <div className="aqi-pollutant-header">
                  <span className="aqi-pollutant-name">{p.name}</span>
                  <span className="aqi-pollutant-value">{p.value} {p.unit}</span>
                </div>
                <div className="aqi-bar-track">
                  <div className="aqi-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
          <div className="aqi-ref">Reference: WHO Air Quality Guidelines (2021)</div>
        </div>
      )}
    </div>
  );
});

const TemperatureChart = React.memo(function TemperatureChart({ data, units }) {
  const currentHour = getCurrentHourInTimezone(data.timezone);
  const today = data.daily.time[0];

  const hours = [];
  const precips = [];
  const startIdx = data.hourly.time.findIndex(t => {
    const datePart = t.split("T")[0];
    const timePart = t.split("T")[1];
    if (!timePart) return false;
    return datePart === today && parseInt(timePart.split(":")[0], 10) === currentHour;
  });

  for (let i = 0; i < 24; i++) {
    const itemIdx = (startIdx >= 0 ? startIdx : 0) + i;
    if (itemIdx >= data.hourly.time.length) break;
    hours.push(convertTemp(data.hourly.temperature_2m[itemIdx], units.temp));
    precips.push(data.hourly.precipitation_probability[itemIdx] ?? 0);
  }

  if (hours.length < 2) return null;

  const minT = Math.min(...hours);
  const maxT = Math.max(...hours);
  const range = maxT - minT || 1;
  const padding = 20;
  const width = 500;
  const height = 150;
  const chartH = height - padding * 2;
  const chartW = width - 30;

  const points = hours.map((t, i) => ({
    x: (i / (hours.length - 1)) * chartW + 15,
    y: padding + chartH - ((t - minT) / range) * chartH,
    temp: t,
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 3;
    const cpx2 = curr.x - (curr.x - prev.x) / 3;
    pathD += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const barWidth = Math.max(chartW / hours.length - 2, 2);
  const precipBars = precips.map((p, i) => ({
    x: (i / (hours.length - 1)) * chartW + 15 - barWidth / 2,
    h: (p / 100) * chartH * 0.3,
    p,
  }));

  return (
    <div className="chart-section">
      <div className="section-title">📈 Temperature & Precipitation</div>
      <div className="glass-card chart-card">
        <div className="chart-labels">
          <span>{minT}°</span>
          <span>{maxT}°</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {precipBars.map((b, i) => (
            <rect key={i} x={b.x} y={height - padding - b.h} width={barWidth} height={b.h} fill="var(--accent)" opacity={0.15 + (b.p / 100) * 0.35} rx="1" />
          ))}
          <path d={areaD} fill="url(#tempGrad)" />
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 4 : 2.5} fill={i === 0 ? "var(--accent)" : "var(--text-muted)"} opacity={i === 0 ? 1 : 0.5} />
          ))}
        </svg>
        <div className="chart-x-labels">
          {hours.map((_, i) => (
            <span key={i} style={{ opacity: i === 0 || i % 4 === 0 ? 1 : 0 }}>{i === 0 ? "Now" : `${i}h`}</span>
          ))}
        </div>
      </div>
    </div>
  );
});

const DailyForecast = React.memo(function DailyForecast({ data, units }) {
  const allTemps = [...data.daily.temperature_2m_min, ...data.daily.temperature_2m_max];
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const range = globalMax - globalMin || 1;

  const days = data.daily.time.map((t, i) => {
    const date = new Date(t + "T00:00:00");
    const dayOfWeek = date.getDay();
    return {
      date,
      day: i === 0 ? "Today" : formatLocalDate(t + "T00:00:00", { weekday: "short" }),
      code: data.daily.weather_code[i],
      min: convertTemp(data.daily.temperature_2m_min[i], units.temp),
      max: convertTemp(data.daily.temperature_2m_max[i], units.temp),
      minRaw: data.daily.temperature_2m_min[i],
      maxRaw: data.daily.temperature_2m_max[i],
      precip: data.daily.precipitation_probability_max[i] != null ? data.daily.precipitation_probability_max[i] : null,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    };
  });

  return (
    <div className="daily-section">
      <div className="section-title">📅 7-Day Forecast</div>
      <div className="glass-card daily-card">
        <div className="daily-list">
          {days.map((d, i) => {
            const leftPct = ((d.minRaw - globalMin) / range) * 100;
            const widthPct = ((d.maxRaw - d.minRaw) / range) * 100;
            return (
              <div key={i} className={`daily-item${d.isWeekend ? " weekend" : ""}`} style={{ "--i": i }}>
                <div className="daily-day">{d.day}</div>
                <div className="daily-icon"><WeatherIcon code={d.code} size="small" /></div>
                <div className="daily-temp-bar">
                  <span className="daily-temp-low">{d.min}°</span>
                  <div className="temp-bar-track">
                    <div className="temp-bar-fill" style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }} />
                  </div>
                  <span className="daily-temp-high">{d.max}°</span>
                </div>
                <div className="daily-precip">
                  {d.precip !== null && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>💧 {d.precip}%</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("weather-theme") || "dark");
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem("weather-units");
    return saved ? JSON.parse(saved) : { temp: "C", wind: "kmh" };
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [locError, setLocError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("weather-recent") || "[]"); } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("weather-favorites") || "[]"); } catch { return []; }
  });
  const [contentVisible, setContentVisible] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCached, setShowCached] = useState(false);
  const [fetchTime, setFetchTime] = useState(Date.now());
  const [searchIdx, setSearchIdx] = useState(-1);
  const [tick, setTick] = useState(0);
  const searchRef = useRef(null);
  const hourlyScrollRef = useRef(null);
  const debounceRef = useRef(null);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("weather-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("weather-units", JSON.stringify(units));
  }, [units]);

  const fetchWeather = useCallback(async (lat, lon, name) => {
    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
      setError("Invalid coordinates provided");
      setIsLoading(false);
      return;
    }
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    setContentVisible(false);
    setIsLoading(true);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,dew_point_2m,visibility&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=7`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide`
        )
      ]);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const weatherData = await weatherRes.json();
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        weatherData.aqi = aqiData.current?.us_aqi || null;
        weatherData.aqiDetails = {
          pm25: aqiData.current?.pm2_5 ?? null,
          pm10: aqiData.current?.pm10 ?? null,
          ozone: aqiData.current?.ozone ?? null,
          no2: aqiData.current?.nitrogen_dioxide ?? null,
        };
      }
      setWeatherData(weatherData);
      setCityName(name);
      setFetchTime(Date.now());
      setFallbackMode(false);
      setLocError(null);
      localStorage.setItem("weather-cache", JSON.stringify({ data: weatherData, name, ts: Date.now() }));
      if (name !== "Your Location") {
        setRecentSearches(prev => {
          const entry = { name: name, latitude: lat, longitude: lon };
          const updated = [entry, ...prev.filter(s => s.name !== name)].slice(0, 5);
          localStorage.setItem("weather-recent", JSON.stringify(updated));
          return updated;
        });
      }
      setTimeout(() => { setIsLoading(false); setContentVisible(true); }, 300);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = setInterval(() => fetchWeather(lat, lon, name), 600000);
    } catch (e) {
      const cached = localStorage.getItem("weather-cache");
      if (cached) {
        try {
          const { data, name: cachedName, ts } = JSON.parse(cached);
          if (Date.now() - ts < 3600000) {
            setWeatherData(data);
            setCityName(cachedName);
            setFetchTime(ts);
            setIsLoading(false);
            setContentVisible(true);
            setShowCached(true);
            return;
          }
        } catch {}
      }
      setError(e.message);
      setIsLoading(false);
    }
  }, []);

  const searchCities = useCallback((query) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (e) {
        console.error("Search error:", e);
      }
    }, 300);
  }, []);

  const handleLocationRequest = useCallback(() => {
    setLocError(null);
    setIsLoading(true);
    setFallbackMode(false);
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser");
      setFallbackMode(true);
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocError(null);
        fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
      },
      (err) => {
        let msg = "Location access denied.";
        if (err.code === 1) msg = "Location permission denied. Please select a city below or allow location access.";
        else if (err.code === 2) msg = "Location unavailable. Please select a city below.";
        else if (err.code === 3) msg = "Location request timed out. Please try again.";
        setLocError(msg);
        setFallbackMode(true);
        setIsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchWeather]);

  useEffect(() => {
    handleLocationRequest();
  }, [handleLocationRequest]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
          searchRef.current?.querySelector("input")?.focus();
        }
      }
      if (e.key === "Escape") { setSearchResults([]); setSearchQuery(""); setSearchIdx(-1); }
      if (e.key === "ArrowDown" && searchResults.length > 0 && document.activeElement.tagName === "INPUT") {
        e.preventDefault();
        setSearchIdx(i => Math.min(i + 1, searchResults.length - 1));
      }
      if (e.key === "ArrowUp" && searchResults.length > 0 && document.activeElement.tagName === "INPUT") {
        e.preventDefault();
        setSearchIdx(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && searchIdx >= 0 && searchResults.length > 0) {
        e.preventDefault();
        const r = searchResults[searchIdx];
        fetchWeather(r.latitude, r.longitude, `${r.name}, ${r.country}`);
        setSearchResults([]);
        setSearchQuery("");
        setSearchIdx(-1);
      }
      if (e.key === "ArrowRight" && hourlyScrollRef.current) {
        hourlyScrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
      }
      if (e.key === "ArrowLeft" && hourlyScrollRef.current) {
        hourlyScrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
      }
      if (e.key === "l" || e.key === "L") { if (document.activeElement.tagName !== "INPUT") handleLocationRequest(); }
      if (e.key === "t" || e.key === "T") { if (document.activeElement.tagName !== "INPUT") toggleTheme(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleLocationRequest, toggleTheme, fetchWeather, searchResults, searchIdx]);

  useEffect(() => {
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(t => t === "dark" ? "light" : "dark");
      });
    } else {
      setTheme(t => t === "dark" ? "light" : "dark");
    }
  };

  const toggleFavorite = useCallback(() => {
    if (!cityName) return;
    setFavorites(prev => {
      const exists = prev.find(f => f.name === cityName);
      let updated;
      if (exists) {
        updated = prev.filter(f => f.name !== cityName);
      } else {
        const lat = weatherData?.latitude;
        const lon = weatherData?.longitude;
        if (lat == null || lon == null) return prev;
        updated = [...prev, { name: cityName, latitude: lat, longitude: lon }].slice(0, 8);
      }
      localStorage.setItem("weather-favorites", JSON.stringify(updated));
      return updated;
    });
  }, [cityName, weatherData]);

  const isFavorite = favorites.some(f => f.name === cityName);

  const shareWeather = useCallback(() => {
    if (!weatherData) return;
    const info = getWeatherInfo(weatherData.current.weather_code);
    const text = `Weather in ${cityName || "Your Location"}: ${convertTemp(weatherData.current.temperature_2m, units.temp)}°${units.temp}, ${info.label}. H:${convertTemp(weatherData.daily.temperature_2m_max[0], units.temp)}° L:${convertTemp(weatherData.daily.temperature_2m_min[0], units.temp)}°`;
    navigator.clipboard.writeText(text).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    });
  }, [weatherData, cityName, units]);

  const weatherAlert = useMemo(() => {
    if (!weatherData) return null;
    const code = weatherData.current.weather_code;
    if (code >= 95) return { level: "severe", title: "Thunderstorm Warning", desc: "Severe thunderstorm conditions detected. Stay safe!" };
    if (code >= 80 && code <= 82) return { level: "moderate", title: "Heavy Rain Alert", desc: "Heavy rain showers expected. Carry an umbrella." };
    if (code >= 65) return { level: "moderate", title: "Heavy Rain Alert", desc: "Heavy rain conditions. Exercise caution." };
    if (code >= 75) return { level: "moderate", title: "Heavy Snow Alert", desc: "Heavy snow conditions. Drive carefully." };
    return null;
  }, [weatherData]);

  return (
    <div className="app-container">
      {weatherData && <div className="animated-bg" style={{ background: getBgGradient(weatherData.current.weather_code, isDaytime(weatherData)) }} />}
      <div className="header glass-card">
        <div className="logo">
          <div className="logo-icon">⛅</div>
          <span>Weather</span>
        </div>
        <div className="header-actions">
          <div ref={searchRef} className="search-container">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search city..."
              value={searchQuery}
              onChange={e => searchCities(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              aria-label="Search for a city"
              role="combobox"
              aria-expanded={searchResults.length > 0}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((r, idx) => (
                  <div key={r.id} className={`search-result-item${idx === searchIdx ? " highlighted" : ""}`} onClick={() => {
                    fetchWeather(r.latitude, r.longitude, `${r.name}, ${r.country}`);
                    setSearchResults([]);
                    setSearchQuery("");
                  }}>
                    <div className="search-result-name">{r.name}</div>
                    <div className="search-result-country">{r.admin1 || ""} {r.country}</div>
                  </div>
                ))}
              </div>
            )}
            {searchResults.length === 0 && searchQuery.length === 0 && searchFocused && recentSearches.length > 0 && (
              <div className="search-results">
                <div className="recent-search">Recent</div>
                {recentSearches.map((r, i) => (
                  <div key={i} className="search-result-item" onClick={() => fetchWeather(r.latitude, r.longitude, r.name)}>
                    <div className="search-result-name">{r.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-icon" onClick={handleLocationRequest} title="Use my location" aria-label="Use my current location">
            📍
          </button>
          <div className="unit-toggle">
            <button className={`unit-btn ${units.temp === "C" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, temp: "C" }))}>°C</button>
            <button className={`unit-btn ${units.temp === "F" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, temp: "F" }))}>°F</button>
          </div>
          <div className="unit-toggle">
            <button className={`unit-btn ${units.wind === "kmh" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, wind: "kmh" }))}>km/h</button>
            <button className={`unit-btn ${units.wind === "mph" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, wind: "mph" }))}>mph</button>
          </div>
          <button className="btn btn-icon" onClick={toggleTheme} title="Toggle theme" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {favorites.length > 0 && !isLoading && (
        <div className="favorites-bar fade-in">
          <div className="favorites-label">Favorites</div>
          <div className="favorites-scroll">
            {favorites.map((f, i) => (
              <div key={i} className={`favorite-chip ${f.name === cityName ? "active" : ""}`} onClick={() => fetchWeather(f.latitude, f.longitude, f.name)}>
                {f.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {weatherAlert && !isLoading && (
        <div className="alert-banner fade-in" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-text">
            <div className="alert-title">{weatherAlert.title}</div>
            <div className="alert-desc">{weatherAlert.desc}</div>
          </div>
        </div>
      )}
      {showCached && !isLoading && (
        <div className="cache-banner fade-in" role="status">
          <span className="cache-icon">⏰</span>
          <span>Showing cached data — unable to fetch live updates</span>
        </div>
      )}

      {isLoading && <LoadingState />}
      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <button className="btn btn-accent" onClick={handleLocationRequest}>Try Again</button>
        </div>
      )}
      {fallbackMode && !isLoading && (
        <div className="fallback-container">
          <div className="glass-card" style={{ padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", maxWidth: "650px", width: "100%" }}>
            {locError && <div className="error-message" style={{ maxWidth: "400px", textAlign: "center" }}>{locError}</div>}
            <div className="fallback-title">Select a City</div>
            <div className="fallback-subtitle">Geolocation is unavailable. Pick a city to see its weather.</div>
            <button className="btn btn-accent" onClick={handleLocationRequest}>
              📍 Try My Location Again
            </button>
            <div className="city-dropdown">
              {MAJOR_CITIES.map(city => (
                <div key={city.name} className="city-btn" onClick={() => fetchWeather(city.lat, city.lon, `${city.name}, ${city.country}`)}>
                  <div className="city-name">{city.name}</div>
                  <div className="city-country">{city.country}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {weatherData && !isLoading && (
        <div className={contentVisible ? "fade-in" : ""}>
          <CurrentWeather data={weatherData} cityName={cityName} units={units} fetchTime={fetchTime} tick={tick} toggleFavorite={toggleFavorite} isFavorite={isFavorite} />
          <WeatherDetails data={weatherData} units={units} />
          <HourlyForecast data={weatherData} units={units} scrollRef={hourlyScrollRef} />
          <TemperatureChart data={weatherData} units={units} />
          <DailyForecast data={weatherData} units={units} />
        </div>
      )}
      {weatherData && !isLoading && (
        <>
          <button className="share-btn" onClick={shareWeather} aria-label="Share weather" title="Copy weather to clipboard">📋</button>
          {showShareToast && <div className="share-toast">Copied to clipboard!</div>}
        </>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => { });
}
