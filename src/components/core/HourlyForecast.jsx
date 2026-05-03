import { useState, memo } from "react";
import { convertTemp, getCurrentHourInTimezone, formatLocalTime } from "../../utils.js";
import WeatherIcon from "./WeatherIcon.jsx";

const HourlyForecast = memo(function HourlyForecast({ data, units, scrollRef }) {
  const [useBrowserTz, setUseBrowserTz] = useState(false);
  const currentHour = getCurrentHourInTimezone(data.timezone, useBrowserTz);
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
    const snowfall = data.hourly.snowfall && data.hourly.snowfall[itemIdx] != null ? data.hourly.snowfall[itemIdx] : null;
    hours.push({
      time: hourStr,
      temp: convertTemp(data.hourly.temperature_2m[itemIdx], units.temp),
      feelsLike: convertTemp(data.hourly.apparent_temperature[itemIdx], units.temp),
      code: data.hourly.weather_code[itemIdx],
      precip: data.hourly.precipitation_probability[itemIdx] != null ? data.hourly.precipitation_probability[itemIdx] : null,
      snowfall,
    });
  }

  return (
    <div className="hourly-section">
      <div className="section-title">
        🕐 24-Hour Forecast
        <button className="tz-toggle-btn" onClick={() => setUseBrowserTz(b => !b)} title="Toggle timezone" aria-label={`Switch to ${useBrowserTz ? "local" : "browser"} timezone`}>
          {useBrowserTz ? "🖥️ My Time" : "📍 Local"}
        </button>
      </div>
      <div className="hourly-scroll" ref={scrollRef}>
        {hours.map((h, i) => (
          <div key={i} className="glass-card hourly-card" style={{ "--i": i }}>
            <div className="hourly-time">{h.time}</div>
            <div className="hourly-icon"><WeatherIcon code={h.code} /></div>
            <div className="hourly-temp">{h.temp}°</div>
            <div className="hourly-feels">Feels {h.feelsLike}°</div>
            <div className="hourly-precip">
              {h.precip !== null && <span className="precip-rain">{h.precip}%💧</span>}
              {h.snowfall !== null && h.snowfall > 0 && <span className="precip-snow">{h.snowfall.toFixed(1)}cm ❄️</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default HourlyForecast;
