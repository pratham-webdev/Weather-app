import { memo } from "react";
import { convertTemp, formatLocalDate } from "../../utils.js";
import WeatherIcon from "./WeatherIcon.jsx";

const DailyForecast = memo(function DailyForecast({ data, units }) {
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

export default DailyForecast;
