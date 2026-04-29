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

const CurrentWeather = React.memo(function CurrentWeather({ data, cityName, units }) {
  const info = getWeatherInfo(data.current.weather_code);
  const { dateStr, timeStr } = getCurrentTimeInTimezone(data.timezone);
  const tzAbbr = data.timezone_abbreviation || "";

  return (
    <div className={`current-weather glass-card weather-${info.type}`}>
      <div className="current-content">
        <div className="current-left">
          <div className="current-city">{cityName || "Your Location"}</div>
          <div className="current-temp">{convertTemp(data.current.temperature_2m, units.temp)}°{units.temp}</div>
          <div className="current-condition">{info.emoji} {info.label}</div>
          <div className="current-high-low">H: {convertTemp(data.daily.temperature_2m_max[0], units.temp)}° L: {convertTemp(data.daily.temperature_2m_min[0], units.temp)}°</div>
          <div className="current-date">{dateStr} · {timeStr}{tzAbbr ? ` ${tzAbbr}` : ""}</div>
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

  const details = [
    { icon: "💧", label: "Humidity", value: data.current.relative_humidity_2m, unit: "%" },
    { icon: "💨", label: "Wind", value: `${convertWind(data.current.wind_speed_10m, units.wind)} ${windDirection(data.current.wind_direction_10m)}`, unit: units.wind === "mph" ? "mph" : "km/h" },
    { icon: "🌬️", label: "Gusts", value: convertWind(data.current.wind_gusts_10m, units.wind), unit: units.wind === "mph" ? " mph" : " km/h" },
    { icon: "☀️", label: "UV Index", value: Math.round(data.daily.uv_index_max[0] * 10) / 10, unit: "" },
    { icon: "🌡️", label: "Pressure", value: Math.round(data.current.surface_pressure), unit: " hPa" },
    { icon: "🤔", label: "Feels Like", value: convertTemp(data.current.apparent_temperature, units.temp), unit: `°${units.temp}` },
    { icon: "🌅", label: "Sunrise", value: sunrise, unit: "" },
    { icon: "🌇", label: "Sunset", value: sunset, unit: "" },
    { icon: "🫁", label: "AQI", value: aqi !== null && aqi !== undefined ? aqi : "N/A", unit: aqi !== null && aqi !== undefined ? ` (${aqiLabel})` : "" },
  ];

  return (
    <div className="details-grid">
      {details.map((d, i) => (
        <div key={i} className="glass-card detail-card" style={d.unit.includes(aqiLabel) ? { borderColor: aqiColor } : {}}>
          <div className="detail-icon">{d.icon}</div>
          <div className="detail-label">{d.label}</div>
          <div className="detail-value">{d.value}<span className="detail-unit">{d.unit}</span></div>
        </div>
      ))}
    </div>
  );
});

const HourlyForecast = React.memo(function HourlyForecast({ data, units }) {
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
      code: data.hourly.weather_code[itemIdx],
      precip: data.hourly.precipitation_probability[itemIdx] != null ? data.hourly.precipitation_probability[itemIdx] : null,
    });
  }

  return (
    <div className="hourly-section">
      <div className="section-title">🕐 24-Hour Forecast</div>
      <div className="hourly-scroll">
        {hours.map((h, i) => (
          <div key={i} className="glass-card hourly-card">
            <div className="hourly-time">{h.time}</div>
            <div className="hourly-icon"><WeatherIcon code={h.code} /></div>
            <div className="hourly-temp">{h.temp}°</div>
            {h.precip !== null && <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{h.precip}%💧</div>}
          </div>
        ))}
      </div>
    </div>
  );
});

const DailyForecast = React.memo(function DailyForecast({ data, units }) {
  const allTemps = [...data.daily.temperature_2m_min, ...data.daily.temperature_2m_max];
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);
  const range = globalMax - globalMin || 1;

  const days = data.daily.time.map((t, i) => ({
    date: new Date(t + "T00:00:00"),
    day: i === 0 ? "Today" : formatLocalDate(t + "T00:00:00", { weekday: "short" }),
    code: data.daily.weather_code[i],
    min: convertTemp(data.daily.temperature_2m_min[i], units.temp),
    max: convertTemp(data.daily.temperature_2m_max[i], units.temp),
    minRaw: data.daily.temperature_2m_min[i],
    maxRaw: data.daily.temperature_2m_max[i],
    precip: data.daily.precipitation_probability_max[i] != null ? data.daily.precipitation_probability_max[i] : null,
  }));

  return (
    <div className="daily-section">
      <div className="section-title">📅 7-Day Forecast</div>
      <div className="glass-card daily-card">
        <div className="daily-list">
          {days.map((d, i) => {
            const leftPct = ((d.minRaw - globalMin) / range) * 100;
            const widthPct = ((d.maxRaw - d.minRaw) / range) * 100;
            return (
              <div key={i} className="daily-item">
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
  const [contentVisible, setContentVisible] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
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
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=7`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
        )
      ]);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const weatherData = await weatherRes.json();
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        weatherData.aqi = aqiData.current?.us_aqi || null;
      }
      setWeatherData(weatherData);
      setCityName(name);
      setFallbackMode(false);
      setLocError(null);
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
      if (e.key === "Escape") { setSearchResults([]); setSearchQuery(""); }
      if (e.key === "l" || e.key === "L") { if (document.activeElement.tagName !== "INPUT") handleLocationRequest(); }
      if (e.key === "t" || e.key === "T") { if (document.activeElement.tagName !== "INPUT") toggleTheme(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleLocationRequest]);

  useEffect(() => {
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
  }, []);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

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
      {weatherData && <div className="animated-bg" style={{ background: getWeatherInfo(weatherData.current.weather_code).type === "clear" ? "var(--gradient-sunny)" : getWeatherInfo(weatherData.current.weather_code).type === "rainy" ? "var(--gradient-rainy)" : getWeatherInfo(weatherData.current.weather_code).type === "snowy" ? "var(--gradient-snowy)" : getWeatherInfo(weatherData.current.weather_code).type === "stormy" ? "var(--gradient-stormy)" : getWeatherInfo(weatherData.current.weather_code).type === "foggy" ? "var(--gradient-foggy)" : "var(--gradient-cloudy)" }} />}
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
                {searchResults.map(r => (
                  <div key={r.id} className="search-result-item" onClick={() => {
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

      {weatherAlert && !isLoading && (
        <div className="alert-banner fade-in" role="alert">
          <span className="alert-icon">⚠️</span>
          <div className="alert-text">
            <div className="alert-title">{weatherAlert.title}</div>
            <div className="alert-desc">{weatherAlert.desc}</div>
          </div>
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
          <CurrentWeather data={weatherData} cityName={cityName} units={units} />
          <WeatherDetails data={weatherData} units={units} />
          <HourlyForecast data={weatherData} units={units} />
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
  const swCode = `
    const CACHE = "weather-v1";
    self.addEventListener("install", e => { self.skipWaiting(); });
    self.addEventListener("activate", e => { e.waitUntil(clients.claim()); });
    self.addEventListener("fetch", e => {
      if (e.request.url.includes("open-meteo.com")) {
        e.respondWith(
          caches.open(CACHE).then(cache =>
            fetch(e.request).then(res => {
              cache.put(e.request, res.clone());
              return res;
            }).catch(() => caches.match(e.request))
          )
        );
      }
    });
  `;
  const blob = new Blob([swCode], { type: "application/javascript" });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl).catch(() => { });
}
