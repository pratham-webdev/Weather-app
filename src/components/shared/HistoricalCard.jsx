import { memo } from "react";
import { convertTemp, getWeatherInfo } from "../../utils.js";

const HistoricalCard = memo(function HistoricalCard({ historical, current, units }) {
  const todayMax = convertTemp(current.daily.temperature_2m_max[0], units.temp);
  const todayMin = convertTemp(current.daily.temperature_2m_min[0], units.temp);
  const yearMax = convertTemp(historical.max, units.temp);
  const yearMin = convertTemp(historical.min, units.temp);
  const todayInfo = getWeatherInfo(current.daily.weather_code[0]);
  const yearInfo = historical.code != null ? getWeatherInfo(historical.code) : null;
  const diff = todayMax - yearMax;

  return (
    <div className="historical-card glass-card fade-in">
      <div className="historical-title">📅 1 Year Ago Today ({historical.date})</div>
      <div className="historical-comparison">
        <div className="historical-then">
          <span className="historical-emoji">{yearInfo ? yearInfo.emoji : "❓"}</span>
          <div className="historical-temps">H: {yearMax}° / L: {yearMin}°</div>
          <div className="historical-label">Last year</div>
        </div>
        <div className="historical-arrow">
          <span className={`historical-diff ${diff > 0 ? "warmer" : diff < 0 ? "cooler" : "same"}`}>
            {diff > 0 ? "🔥" : diff < 0 ? "❄️" : "➡️"} {diff > 0 ? "+" : ""}{diff}°
          </span>
        </div>
        <div className="historical-now">
          <span className="historical-emoji">{todayInfo.emoji}</span>
          <div className="historical-temps">H: {todayMax}° / L: {todayMin}°</div>
          <div className="historical-label">Today</div>
        </div>
      </div>
    </div>
  );
});

export default HistoricalCard;
