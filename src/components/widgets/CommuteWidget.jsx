import { memo } from "react";
import { convertTemp, convertWind } from "../../utils.js";

const COMMUTE_MODES = [
  { key: "walk", emoji: "🚶", label: "Walk" },
  { key: "bike", emoji: "🚴", label: "Bike" },
  { key: "drive", emoji: "🚗", label: "Drive" },
];

const getAdvice = (mode, temp, precip, wind) => {
  switch (mode) {
    case "walk":
      if (precip >= 70) return "☂️ Heavy rain — take an umbrella or wait";
      if (precip >= 40) return "🌦️ Light rain possible — pack an umbrella";
      if (temp > 32) return "🥵 Very hot — stay hydrated";
      if (temp < 5) return "🧣 Cold — bundle up";
      if (wind >= 40) return "💨 Very windy — difficult walk";
      return "✅ Perfect walk weather";
    case "bike":
      if (precip >= 50) return "🌧️ Wet roads — ride carefully";
      if (wind >= 35) return "💨 Strong headwinds expected";
      if (wind >= 20) return "🌬️ Breezy but manageable";
      if (temp > 30) return "☀️ Hot — bring water";
      if (temp < 0) return "🥶 Freezing — icy roads possible";
      return "🚴 Great cycling conditions";
    case "drive":
      if (precip >= 70) return "⚠️ Heavy rain — slow down, increase distance";
      if (precip >= 40) return "🌧️ Wet roads — use caution";
      if (wind >= 50) return "💨 High crosswinds — steady steering";
      return "✅ Clear driving conditions";
    default: return "";
  }
};

const CommuteWidget = memo(function CommuteWidget({ data, units }) {
  const h = data.hourly;
  if (!h?.time?.length) return null;

  const currentHour = new Date().getHours();
  const hourIdx = Math.min(currentHour, h.time.length - 1);
  const temp = convertTemp(h.temperature_2m[hourIdx] ?? data.current.temperature_2m, units.temp);
  const precip = h.precipitation_probability?.[hourIdx] ?? 0;
  const wind = convertWind(h.wind_speed_10m?.[hourIdx] ?? data.current.wind_speed_10m, units.wind);
  const windUnit = units.wind === "mph" ? "mph" : "km/h";
  const code = h.weather_code?.[hourIdx] ?? data.current.weather_code;

  const timeLabel = `${currentHour === 0 ? "12" : currentHour > 12 ? currentHour - 12 : currentHour}${currentHour >= 12 ? "PM" : "AM"} — Right Now`;

  return (
    <div className="commute-widget glass-card fade-in">
      <div className="commute-header">
        <span>🚗 Commute — {timeLabel}</span>
        <span className="commute-current-temp">{temp}°{units.temp}</span>
      </div>
      <div className="commute-modes-grid">
        {COMMUTE_MODES.map(m => {
          const advice = getAdvice(m.key, temp, precip, wind);
          const severity = precip >= 70 || (m.key === "bike" && wind >= 35) || (m.key === "drive" && precip >= 60) ? "bad" : precip >= 40 || (m.key === "bike" && wind >= 20) ? "warn" : "good";
          return (
            <div key={m.key} className={`commute-mode-card commute-${severity}`}>
              <div className="commute-mode-icon">{m.emoji}</div>
              <div className="commute-mode-label">{m.label}</div>
              <div className="commute-mode-metrics">
                <span>🌧️ {precip}%</span>
                <span>💨 {wind} {windUnit}</span>
              </div>
              <div className="commute-mode-advice">{advice}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CommuteWidget;
