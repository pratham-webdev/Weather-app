import { memo, useState, useEffect, useRef } from "react";
import { convertTemp, getCurrentTimeInTimezone, isDaytime, getBgGradient, getWeatherInfo } from "../../utils.js";
import AnimatedIcon from "./AnimatedIcon.jsx";
import SunArc from "../shared/SunArc.jsx";
import WeatherIcon from "./WeatherIcon.jsx";

const CurrentWeather = memo(function CurrentWeather({ data, cityName, units, fetchTime, tick, toggleFavorite, isFavorite, mood, historical }) {
  const info = getWeatherInfo(data.current.weather_code);
  const { dateStr, timeStr } = getCurrentTimeInTimezone(data.timezone);
  const tzAbbr = data.timezone_abbreviation || "";
  const elapsed = Math.round((Date.now() - fetchTime) / 60000);
  const updatedLabel = elapsed < 1 ? "Just now" : elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m ago`;
  const daytime = isDaytime(data);
  const weatherClass = `${info.type}-${daytime ? "day" : "night"}`;

  const sentinelRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const initTimer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => setIsCompact(!entry.isIntersecting),
        { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
      );
      observer.observe(sentinel);
      const recheck = () => setIsCompact(!sentinel.checkVisibility ? true : sentinel.checkVisibility());
      window.addEventListener("resize", recheck);
      return () => { observer.disconnect(); window.removeEventListener("resize", recheck); };
    }, 150);
    return () => clearTimeout(initTimer);
  }, []);

  return (
    <>
      <div ref={sentinelRef} style={{ height: 1, pointerEvents: "none", visibility: "hidden" }} />
      <div className={`current-weather glass-card weather-${weatherClass}${isCompact ? " weather-compact" : ""}`}>
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
            {!isCompact && mood && <div className="weather-mood-inline">{mood.tag}</div>}
            <div className="current-high-low">H: {convertTemp(data.daily.temperature_2m_max[0], units.temp)}° L: {convertTemp(data.daily.temperature_2m_min[0], units.temp)}°</div>
            {!isCompact && (
              <>
                <div className="current-date">{dateStr} · {timeStr}{tzAbbr ? ` ${tzAbbr}` : ""}</div>
                {historical && (
                  <div className="year-ago-inline">
                    <span className="year-ago-label">📅 {historical.date.split("-")[0]}:</span>
                    <span className="year-ago-then">{getWeatherInfo(historical.code).emoji} {convertTemp(historical.max, units.temp)}°/{convertTemp(historical.min, units.temp)}°</span>
                    <span className="year-ago-arrow">→</span>
                    <span className="year-ago-now">Today {convertTemp(data.daily.temperature_2m_max[0], units.temp)}°/{convertTemp(data.daily.temperature_2m_min[0], units.temp)}°</span>
                    <span className={`year-ago-diff ${(data.daily.temperature_2m_max[0] - historical.max) > 0 ? "warmer" : (data.daily.temperature_2m_max[0] - historical.max) < 0 ? "cooler" : "same"}`}>
                      {(data.daily.temperature_2m_max[0] - historical.max) > 0 ? "🔥" : (data.daily.temperature_2m_max[0] - historical.max) < 0 ? "❄️" : "➡️"} {(data.daily.temperature_2m_max[0] - historical.max) > 0 ? "+" : ""}{Math.round(data.daily.temperature_2m_max[0] - historical.max)}°
                    </span>
                  </div>
                )}
                <div className="current-updated">Updated {updatedLabel}</div>
              </>
            )}
          </div>
          <div className="current-center">
            {!isCompact ? <SunArc data={data} /> : (
              <div className="current-mini-time">
                <span>{timeStr}</span>
                <span className="current-mini-date">{dateStr}</span>
              </div>
            )}
          </div>
          <div className="current-right">
            {!isCompact ? <AnimatedIcon type={info.type} /> : <WeatherIcon code={data.current.weather_code} size="large" />}
          </div>
        </div>
      </div>
    </>
  );
});

export default CurrentWeather;
