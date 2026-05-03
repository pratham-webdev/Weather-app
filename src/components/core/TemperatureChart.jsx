import { memo } from "react";
import { convertTemp, getCurrentHourInTimezone } from "../../utils.js";

const TemperatureChart = memo(function TemperatureChart({ data, units }) {
  const currentHour = getCurrentHourInTimezone(data.timezone);
  const today = data.daily.time[0];

  const hours = [], feelsLikeHours = [], precips = [];
  const startIdx = data.hourly.time.findIndex(t => {
    const datePart = t.split("T")[0];
    const timePart = t.split("T")[1];
    if (!timePart) return false;
    return datePart === today && parseInt(timePart.split(":")[0], 10) === currentHour;
  });

  for (let i = 0; i < 24; i++) {
    const itemIdx = (startIdx >= 0 ? startIdx : 0) + i;
    if (itemIdx >= data.hourly.time.length) break;
    hours.push(convertTemp(data.hourly.temperature_2m[itemIdx], units.temp));
    feelsLikeHours.push(convertTemp(data.hourly.apparent_temperature[itemIdx], units.temp));
    precips.push(data.hourly.precipitation_probability[itemIdx] ?? 0);
  }

  if (hours.length < 2) return null;

  const allTemps = [...hours, ...feelsLikeHours];
  const minT = Math.min(...allTemps), maxT = Math.max(...allTemps);
  const range = maxT - minT || 1;
  const padding = 20, width = 500, height = 150;
  const chartH = height - padding * 2, chartW = width - 30;

  const toPath = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], curr = pts[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = curr.x - (curr.x - prev.x) / 3;
      d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const points = hours.map((t, i) => ({ x: (i / (hours.length - 1)) * chartW + 15, y: padding + chartH - ((t - minT) / range) * chartH, temp: t }));
  const feelsPoints = feelsLikeHours.map((t, i) => ({ x: (i / (feelsLikeHours.length - 1)) * chartW + 15, y: padding + chartH - ((t - minT) / range) * chartH, temp: t }));

  const pathD = toPath(points);
  const feelsPathD = toPath(feelsPoints);
  const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const barWidth = Math.max(chartW / hours.length - 2, 2);
  const precipBars = precips.map((p, i) => ({ x: (i / (hours.length - 1)) * chartW + 15 - barWidth / 2, h: (p / 100) * chartH * 0.3, p }));

  return (
    <div className="chart-section">
      <div className="section-title">📈 Temperature & Precipitation</div>
      <div className="glass-card chart-card">
        <div className="chart-legend">
          <span className="legend-item"><span className="legend-dot solid" /> Actual</span>
          <span className="legend-item"><span className="legend-dot dashed" /> Feels Like</span>
        </div>
        <div className="chart-labels"><span>{minT}°</span><span>{maxT}°</span></div>
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {precipBars.map((b, i) => (
            <rect key={i} x={b.x} y={height - padding - b.h} width={barWidth} height={b.h} fill="var(--accent)" opacity={0.15 + (b.p / 100) * 0.35} rx="1" />
          ))}
          <path d={areaD} fill="url(#tempGrad)" />
          <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={feelsPathD} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" opacity="0.6" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === 0 ? 4 : 2.5} fill={i === 0 ? "var(--accent)" : "var(--text-muted)"} opacity={i === 0 ? 1 : 0.5} />
          ))}
        </svg>
        <div className="chart-x-labels">
          {hours.map((_, i) => (
            <span key={i} style={{ opacity: i === 0 || i % 4 === 0 ? 1 : 0 }}>{i === 0 ? "Now" : `${i}h`}</span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default TemperatureChart;
