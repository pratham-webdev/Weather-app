import { useState, memo } from "react";
import { convertTemp, getWeatherInfo } from "../../utils.js";

const QUICK_PICKS = [
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
  { label: "3 months", days: 90 },
  { label: "1 year", days: 365 },
];

const TimeMachine = memo(function TimeMachine({ lat, lon, units }) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(sevenDaysAgo);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentForCompare, setCurrentForCompare] = useState(null);

  const fetchDate = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
      );
      const json = await res.json();
      if (json.daily?.temperature_2m_max?.[0] != null) {
        const r = {
          max: json.daily.temperature_2m_max[0],
          min: json.daily.temperature_2m_min[0],
          code: json.daily.weather_code?.[0],
          date,
        };
        setResult(r);
        setCurrentForCompare({ max: r.max, min: r.min });
      } else {
        setResult(null);
        setCurrentForCompare(null);
      }
    } catch { setResult(null); setCurrentForCompare(null); }
    setLoading(false);
  };

  const info = result ? getWeatherInfo(result.code) : null;

  return (
    <div className="glass-card fade-in timemachine-card">
      <div className="section-title">⏰ Time Machine</div>
      <div className="timemachine-picker">
        <input type="date" className="timemachine-date" value={date} max={new Date(Date.now() - 86400000).toISOString().split("T")[0]} onChange={e => setDate(e.target.value)} />
        <button className="btn btn-accent timemachine-btn" onClick={fetchDate} disabled={!date || loading}>{loading ? "Loading..." : "Go"}</button>
      </div>
      <div className="timemachine-quick-picks">
        {QUICK_PICKS.map(p => (
          <button key={p.label} className="quick-pick-btn" onClick={() => { setDate(new Date(Date.now() - p.days * 86400000).toISOString().split("T")[0]); }}>
            {p.label} ago
          </button>
        ))}
      </div>
      {loading && (
        <div className="timemachine-loading">
          <div className="loading-spinner" />
          <span>Fetching historical data...</span>
        </div>
      )}
      {result && info && (
        <div className="timemachine-result fade-in">
          <div className="tm-emoji">{info.emoji}</div>
          <div className="tm-condition">{info.label}</div>
          <div className="tm-date">{result.date}</div>
          <div className="tm-temps">
            <span className="tm-high">H: {convertTemp(result.max, units.temp)}°{units.temp}</span>
            <span className="tm-low">L: {convertTemp(result.min, units.temp)}°{units.temp}</span>
          </div>
          {currentForCompare && (
            <div className="tm-compare">
              <span>Compared to today</span>
              <div className="tm-diff-row">
                <span className={`tm-diff ${result.max > 20 ? "warmer" : "cooler"}`}>
                  {result.max > 20 ? "🔥 Warmer" : "❄️ Cooler"} than now
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {result && !info && <div className="tm-no-data">No data available for this date</div>}
    </div>
  );
});

export default TimeMachine;
