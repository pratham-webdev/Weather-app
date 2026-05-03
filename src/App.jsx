import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  getBgGradient, getWeatherInfo, convertTemp, getCurrentTimeInTimezone,
  isDaytime, trackFeature, MAJOR_CITIES, getCurrentHourInTimezone,
  getWeatherMood, getMoonPhase,
} from "./utils.js";
import { soundscape } from "./soundscape.js";
import CurrentWeather from "./components/core/CurrentWeather.jsx";
import WeatherDetails from "./components/core/WeatherDetails.jsx";
import HourlyForecast from "./components/core/HourlyForecast.jsx";
import DailyForecast from "./components/core/DailyForecast.jsx";
import TemperatureChart from "./components/core/TemperatureChart.jsx";
import WearRecommender from "./components/widgets/WearRecommender.jsx";
import ActivityPlanner from "./components/widgets/ActivityPlanner.jsx";
import CommuteWidget from "./components/widgets/CommuteWidget.jsx";
import PlantCare from "./components/widgets/PlantCare.jsx";
import AllergyRisk from "./components/widgets/AllergyRisk.jsx";
import GoldenHour from "./components/widgets/GoldenHour.jsx";
import FunStats from "./components/widgets/FunStats.jsx";
import WeatherParticles from "./components/visual/WeatherParticles.jsx";
import VoiceSearch from "./components/interactive/VoiceSearch.jsx";
import WeatherRadar from "./components/interactive/WeatherRadar.jsx";
import TimeMachine from "./components/interactive/TimeMachine.jsx";
import TriviaGame from "./components/interactive/TriviaGame.jsx";
import ComparisonModal from "./components/interactive/ComparisonModal.jsx";
import CitySearch from "./components/core/CitySearch.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
import LoadingState from "./components/shared/LoadingState.jsx";

const TABS = [
  { id: "today", label: "Today", icon: "🌤️" },
  { id: "forecast", label: "Forecast", icon: "📊" },
  { id: "insights", label: "Insights", icon: "💡" },
  { id: "explore", label: "Explore", icon: "🔭" },
];

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [theme, setTheme] = useState(() => localStorage.getItem("weather-theme") || "dark");
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem("weather-units");
    return saved ? JSON.parse(saved) : { temp: "C", wind: "kmh" };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [locError, setLocError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("weather-favorites") || "[]"); } catch { return []; }
  });
  const [contentVisible, setContentVisible] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showCached, setShowCached] = useState(false);
  const [fetchTime, setFetchTime] = useState(Date.now());
  const [tick, setTick] = useState(0);
  const [voiceQuery, setVoiceQuery] = useState("");
  const [moonData, setMoonData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [compareCities, setCompareCities] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [tabsCompact, setTabsCompact] = useState(false);
  const [audioMode, setAudioMode] = useState(() => localStorage.getItem("audio-mode") || "lofi");
  const [audioVolume, setAudioVolume] = useState(() => parseFloat(localStorage.getItem("audio-vol") || "0.3"));
  const [audioPrompted, setAudioPrompted] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const hourlyScrollRef = useRef(null);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("weather-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("weather-units", JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    soundscape.onStatusChange(state => setAudioLoading(state.loading));
  }, []);

  useEffect(() => {
    localStorage.setItem("audio-mode", audioMode);
  }, [audioMode]);

  useEffect(() => {
    localStorage.setItem("audio-vol", String(audioVolume));
    soundscape.setVolume(audioVolume);
  }, [audioVolume]);

  useEffect(() => {
    if (weatherData) {
      const info = getWeatherInfo(weatherData.current.weather_code);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${encodeURIComponent(info.emoji)}</text></svg>`;
      const icon = document.querySelector("link[rel='icon']");
      if (icon) icon.href = `data:image/svg+xml,${svg}`;
      document.title = `${convertTemp(weatherData.current.temperature_2m, units.temp)}°${units.temp} ${info.label} — ${cityName || "Weather"}`;
    }
  }, [weatherData, units, cityName]);

  const fetchWeather = useCallback(async (lat, lon, name) => {
    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) { setError("Invalid coordinates"); setIsLoading(false); return; }
    lat = parseFloat(lat); lon = parseFloat(lon);
    setContentVisible(false); setIsLoading(true); setProgressVisible(true); setError(null);
    setMoonData(null); setHistoricalData(null);
    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure,dew_point_2m,visibility&hourly=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation_probability,snowfall&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=7`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide`)
      ]);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const wd = await weatherRes.json();
      setMoonData({ moon_phase: getMoonPhase(), moonrise: null, moonset: null });
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        wd.aqi = aqiData.current?.us_aqi || null;
        wd.aqiDetails = { pm25: aqiData.current?.pm2_5 ?? null, pm10: aqiData.current?.pm10 ?? null, ozone: aqiData.current?.ozone ?? null, no2: aqiData.current?.nitrogen_dioxide ?? null };
      }
      const now = new Date(); const yearAgo = new Date(now); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      const yearAgoStr = yearAgo.toISOString().split("T")[0];
      const histRes = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${yearAgoStr}&end_date=${yearAgoStr}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`);
      if (histRes.ok) {
        const hj = await histRes.json();
        if (hj.daily?.temperature_2m_max?.[0] != null) setHistoricalData({ max: hj.daily.temperature_2m_max[0], min: hj.daily.temperature_2m_min[0], code: hj.daily.weather_code?.[0], date: yearAgoStr });
      }
      setWeatherData(wd); setCityName(name); setFetchTime(Date.now()); setFallbackMode(false); setLocError(null);
      localStorage.setItem("weather-cache", JSON.stringify({ data: wd, name, ts: Date.now() }));
      setTimeout(() => { setIsLoading(false); setContentVisible(true); setProgressVisible(false); }, 300);
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = setInterval(() => fetchWeather(lat, lon, name), 600000);
    } catch (e) {
      setProgressVisible(false);
      const cached = localStorage.getItem("weather-cache");
      if (cached) {
        try {
          const { data, name: cn, ts } = JSON.parse(cached);
          if (Date.now() - ts < 3600000) { setWeatherData(data); setCityName(cn); setFetchTime(ts); setIsLoading(false); setContentVisible(true); setShowCached(true); return; }
        } catch {}
      }
      setError(e.message); setIsLoading(false);
    }
  }, []);

  const handleLocationRequest = useCallback(() => {
    setLocError(null); setIsLoading(true); setFallbackMode(false);
    if (!navigator.geolocation) { setLocError("Geolocation is not supported"); setFallbackMode(true); setIsLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocError(null); fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location"); },
      (err) => {
        let msg = "Location access denied.";
        if (err.code === 1) msg = "Location permission denied. Please select a city below.";
        else if (err.code === 2) msg = "Location unavailable. Please select a city below.";
        else if (err.code === 3) msg = "Location request timed out.";
        setLocError(msg); setFallbackMode(true); setIsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchWeather]);

  useEffect(() => { handleLocationRequest(); }, [handleLocationRequest]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showComparison) { setShowComparison(false); setCompareCities(null); }
      if (e.key === "ArrowRight" && hourlyScrollRef.current) hourlyScrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
      if (e.key === "ArrowLeft" && hourlyScrollRef.current) hourlyScrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
      if (e.key === "l" || e.key === "L") { if (document.activeElement.tagName !== "INPUT") handleLocationRequest(); }
      if (e.key === "t" || e.key === "T") { if (document.activeElement.tagName !== "INPUT") toggleTheme(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleLocationRequest, showComparison]);

  useEffect(() => { return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); }; }, []);
  useEffect(() => { const interval = setInterval(() => setTick(t => t + 1), 60000); return () => clearInterval(interval); }, []);

  const toggleTheme = () => {
    trackFeature("theme_toggle");
    setTheme(t => t === "dark" ? "light" : "dark");
  };

  const toggleFavorite = useCallback(() => {
    trackFeature("favorites");
    if (!cityName) return;
    setFavorites(prev => {
      const exists = prev.find(f => f.name === cityName);
      let updated;
      if (exists) updated = prev.filter(f => f.name !== cityName);
      else {
        const lat = weatherData?.latitude, lon = weatherData?.longitude;
        if (lat == null || lon == null) return prev;
        updated = [...prev, { name: cityName, latitude: lat, longitude: lon }].slice(0, 8);
      }
      localStorage.setItem("weather-favorites", JSON.stringify(updated));
      return updated;
    });
  }, [cityName, weatherData]);

  const isFavorite = favorites.some(f => f.name === cityName);

  const shareWeather = useCallback(() => {
    trackFeature("share");
    if (!weatherData) return;
    const info = getWeatherInfo(weatherData.current.weather_code);
    const text = `Weather in ${cityName || "Your Location"}: ${convertTemp(weatherData.current.temperature_2m, units.temp)}°${units.temp}, ${info.label}. H:${convertTemp(weatherData.daily.temperature_2m_max[0], units.temp)}° L:${convertTemp(weatherData.daily.temperature_2m_min[0], units.temp)}°`;
    if (navigator.share) navigator.share({ title: "Weather", text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => { setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2000); });
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

  const startComparison = useCallback((clickedFav) => {
    trackFeature("comparison");
    const cities = [clickedFav, { name: cityName, latitude: weatherData?.latitude, longitude: weatherData?.longitude }].filter(c => c.name && c.latitude != null);
    setCompareCities(cities); setShowComparison(true);
  }, [cityName, weatherData]);

  const handleVoiceSearch = useCallback((transcript) => {
    setVoiceQuery(transcript);
    trackFeature("search");
  }, []);

  const setAudioModeWithSound = useCallback((mode) => {
    setAudioPrompted(true);
    if (mode === "off") { soundscape.stop(); setAudioMode("off"); }
    else if (mode === "lofi") soundscape.start("lofi");
    else if (mode === "weather") {
      const type = weatherData ? getWeatherInfo(weatherData.current.weather_code).type : "clear";
      soundscape.start("weather", type);
    }
    setAudioMode(mode);
  }, [weatherData]);

  const handleAudioInteraction = useCallback(() => {
    if (!audioPrompted && weatherData) {
      setAudioPrompted(true);
      const type = getWeatherInfo(weatherData.current.weather_code).type;
      if (audioMode === "lofi") soundscape.start("lofi");
      else if (audioMode === "weather") soundscape.start("weather", type);
    }
  }, [audioPrompted, audioMode, weatherData]);

  const daytime = weatherData ? isDaytime(weatherData) : true;
  const weatherType = weatherData ? getWeatherInfo(weatherData.current.weather_code).type : "clear";
  const mood = weatherData ? getWeatherMood(weatherData.current.weather_code, weatherData.current.temperature_2m, weatherData.current.wind_speed_10m, weatherData.current.relative_humidity_2m) : null;

  const currentStation = soundscape.getCurrentStation();

  return (
    <div className="app-container" onClick={handleAudioInteraction}>
      {progressVisible && <div className="progress-bar" />}
      {weatherData && <div className="animated-bg" style={{ background: getBgGradient(weatherData.current.weather_code, daytime) }} />}
      {weatherData && <WeatherParticles type={weatherType} />}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <header className="header glass-card">
        <div className="logo"><div className="logo-icon">⛅</div><span>Weather</span></div>
        <div className="header-actions">
          <CitySearch onSelect={(r) => { fetchWeather(r.latitude, r.longitude, r.name); trackFeature("search"); }} voiceQuery={voiceQuery} />
          <VoiceSearch onSearch={handleVoiceSearch} />
          <button className="btn btn-icon" onClick={handleLocationRequest} title="Use my location (L)" aria-label="Use my current location">📍</button>

          <div className="audio-pill">
            {["lofi", "weather", "off"].map(m => (
              <button key={m} className={`audio-mode-btn${audioMode === m ? " active" : ""}`} onClick={(e) => { e.stopPropagation(); setAudioModeWithSound(m); }} title={m === "lofi" ? "Lofi radio" : m === "weather" ? "Weather sounds" : "Off"}>
                {m === "lofi" ? "🎵" : m === "weather" ? "🌧️" : "🔇"}
              </button>
            ))}
            {audioMode !== "off" && audioPrompted && (
              <div className="audio-controls-row">
                {audioLoading && <div className="audio-loading-spinner" />}
                <input type="range" className="soundscape-vol" min="0" max="1" step="0.05" value={audioVolume} onChange={e => setAudioVolume(parseFloat(e.target.value))} />
                {audioMode === "lofi" && (
                  <button className="btn-skip-station" onClick={(e) => { e.stopPropagation(); soundscape.skipStation(); }} title="Skip station">⏭️</button>
                )}
              </div>
            )}
            {audioMode !== "off" && audioPrompted && <span className="now-playing">{audioLoading ? "Connecting..." : (audioMode === "lofi" ? currentStation?.name || "Loading..." : "Weather Sounds")}</span>}
          </div>

          <div className="unit-toggle">
            <button className={`unit-btn ${units.temp === "C" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, temp: "C" }))}>°C</button>
            <button className={`unit-btn ${units.temp === "F" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, temp: "F" }))}>°F</button>
          </div>
          <div className="unit-toggle">
            <button className={`unit-btn ${units.wind === "kmh" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, wind: "kmh" }))}>km/h</button>
            <button className={`unit-btn ${units.wind === "mph" ? "active" : ""}`} onClick={() => setUnits(u => ({ ...u, wind: "mph" }))}>mph</button>
          </div>
          <button className="btn btn-icon" onClick={shareWeather} title="Share weather" aria-label="Share weather">📋</button>
          <button className="btn btn-icon" onClick={toggleTheme} title="Toggle theme (T)" aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>
      </header>

      {favorites.length > 0 && !isLoading && (
        <div className="favorites-bar fade-in">
          <div className="favorites-label">Favorites</div>
          <div className="favorites-scroll">
            {favorites.map((f, i) => (
              <div key={i} className={`favorite-chip ${f.name === cityName ? "active" : ""}`} onClick={() => fetchWeather(f.latitude, f.longitude, f.name)} onDoubleClick={(e) => { e.preventDefault(); startComparison(f); }}>
                {f.name}
              </div>
            ))}
            {favorites.length >= 2 && (
              <div className="favorite-chip compare-chip" onClick={() => { setCompareCities(favorites.slice(0, 3)); setShowComparison(true); }}>🔍 Compare</div>
            )}
          </div>
        </div>
      )}

      {weatherAlert && !isLoading && (
        <div className="alert-banner fade-in" role="alert" aria-live="assertive">
          <span className="alert-icon">⚠️</span>
          <div className="alert-text"><div className="alert-title">{weatherAlert.title}</div><div className="alert-desc">{weatherAlert.desc}</div></div>
        </div>
      )}
      {showCached && !isLoading && (
        <div className="cache-banner fade-in" role="status" aria-live="polite">
          <span className="cache-icon">⏰</span><span>Showing cached data — unable to fetch live updates</span>
        </div>
      )}

      {!audioPrompted && weatherData && !isLoading && (
        <div className="audio-prompt fade-in" role="status">
          <span>🎧 Click anywhere to enable audio</span>
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
            <button className="btn btn-accent" onClick={handleLocationRequest}>📍 Try My Location Again</button>
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
        <div id="main-content" className={contentVisible ? "fade-in" : ""}>
          <CurrentWeather data={weatherData} cityName={cityName} units={units} fetchTime={fetchTime} tick={tick} toggleFavorite={toggleFavorite} isFavorite={isFavorite} mood={mood} historical={historicalData} onCompactChange={setTabsCompact} />

          <nav className={`tab-bar glass-card${tabsCompact ? " tabs-compact" : ""}`} role="tablist">
            {TABS.map(tab => (
              <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={`tab-btn${activeTab === tab.id ? " active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          {activeTab === "today" && (
            <div className="tab-content fade-in">
              <WeatherDetails data={weatherData} units={units} moonData={moonData} />
              <div className="quick-insights-grid">
                <WearRecommender data={weatherData} units={units} />
                <AllergyRisk data={weatherData} />
                <PlantCare data={weatherData} units={units} />
                <GoldenHour data={weatherData} />
              </div>
              <ActivityPlanner data={weatherData} units={units} />
            </div>
          )}

          {activeTab === "forecast" && (
            <div className="tab-content fade-in">
              <CommuteWidget data={weatherData} units={units} />
              <HourlyForecast data={weatherData} units={units} scrollRef={hourlyScrollRef} />
              <TemperatureChart data={weatherData} units={units} />
              <DailyForecast data={weatherData} units={units} />
            </div>
          )}

          {activeTab === "insights" && (
            <div className="tab-content fade-in">
              <FunStats data={weatherData} units={units} />
              <TriviaGame />
            </div>
          )}

          {activeTab === "explore" && (
            <div className="tab-content fade-in">
              <WeatherRadar currentLat={weatherData.latitude} currentLon={weatherData.longitude} units={units} data={weatherData} />
              <TimeMachine lat={weatherData.latitude} lon={weatherData.longitude} units={units} />
              {favorites.length >= 2 && (
                <div className="glass-card" style={{ textAlign: "center", padding: "16px 20px" }}>
                  <button className="btn btn-accent" onClick={() => { setCompareCities(favorites.slice(0, 3)); setShowComparison(true); }}>🔍 Compare Cities</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {weatherData && !isLoading && showShareToast && <div className="share-toast">Copied to clipboard!</div>}
      {showComparison && compareCities && <ComparisonModal cities={compareCities} currentCity={{ name: cityName, latitude: weatherData?.latitude, longitude: weatherData?.longitude }} units={units} onClose={() => { setShowComparison(false); setCompareCities(null); }} />}
    </div>
  );
}
