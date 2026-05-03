import { useState, memo } from "react";

const AQIDetails = memo(function AQIDetails({ aqiDetails }) {
  const [expanded, setExpanded] = useState(true);
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

export default AQIDetails;
