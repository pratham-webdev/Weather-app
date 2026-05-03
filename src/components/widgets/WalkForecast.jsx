import { useState, memo } from "react";
import { convertTemp } from "../../utils.js";

const WalkForecast = memo(function WalkForecast({ data, units }) {
  const [duration, setDuration] = useState(30);
  const now = new Date();
  const currentHour = now.getHours();
  const hours = data.hourly;
  if (!hours?.time?.length) return null;

  const steps = { 15: 1, 30: 2, 45: 3, 60: 4 };
  const count = steps[duration] || 2;

  const hourlyData = [];
  for (let i = 0; i < count; i++) {
    const idx = currentHour + i;
    if (idx < hours.time?.length) {
      const time = hours.time[idx];
      const precip = hours.precipitation_probability?.[idx] ?? 0;
      const temp = hours.temperature_2m?.[idx] ?? data.current.temperature_2m;
      const uv = hours.uv_index?.[idx] ?? data.daily?.uv_index_max?.[0] ?? 0;
      hourlyData.push({
        label: new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        precip,
        temp: convertTemp(temp, units.temp),
        uv: Math.round(uv),
      });
    }
  }

  const maxPrecip = Math.max(...hourlyData.map(h => h.precip), 0);
  const willRain = maxPrecip >= 70;
  const caution = maxPrecip >= 30 && maxPrecip < 70;
  const firstRainHour = hourlyData.find(h => h.precip >= 50);
  const avgTemp = Math.round(hourlyData.reduce((s, h) => s + h.temp, 0) / hourlyData.length);
  const maxUv = Math.max(...hourlyData.map(h => h.uv), 0);

  const resultMsg = willRain
    ? `🌧️ Likely rain around ${firstRainHour?.label} — bring an umbrella!`
    : caution
      ? `🌦️ Possible showers (${maxPrecip}% max) — light jacket advised`
      : `✅ Clear for ${duration}min. ${avgTemp}°${units.temp} — perfect walk weather!`;

  return (
    <div className="walk-widget-inner">
      <div className="walk-header">🚶 Will it rain on my walk?</div>
      <div className="walk-duration">
        {[15, 30, 45, 60].map(d => (
          <button key={d} className={`walk-dur-btn${duration === d ? " active" : ""}`} onClick={() => setDuration(d)}>{d}min</button>
        ))}
      </div>

      <div className="walk-bars" role="img" aria-label={`Hourly precipitation for next ${duration} minutes`}>
        {hourlyData.map((h, i) => (
          <div key={i} className="walk-bar-col">
            <div className="walk-bar-track">
              <div className="walk-bar-fill" style={{ height: `${Math.max(h.precip, 4)}%`, background: h.precip >= 70 ? "#ef4444" : h.precip >= 30 ? "#eab308" : "#22c55e" }} />
            </div>
            <div className="walk-bar-pct">{h.precip}%</div>
            <div className="walk-bar-time">{h.label}</div>
          </div>
        ))}
      </div>

      <div className={`walk-result ${willRain ? "walk-bad" : caution ? "walk-caution" : "walk-good"}`}>
        {resultMsg}
      </div>

      <div className="walk-meta">
        <span>🌡️ Avg {avgTemp}°{units.temp}</span>
        {maxUv > 0 && <span>☀️ UV {maxUv}</span>}
      </div>
    </div>
  );
});

export default WalkForecast;
