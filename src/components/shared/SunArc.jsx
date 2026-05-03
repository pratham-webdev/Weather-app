import { memo } from "react";
import { formatLocalTime, isDaytime } from "../../utils.js";

const SunArc = memo(function SunArc({ data }) {
  const sunriseStr = data.daily.sunrise[0];
  const sunsetStr = data.daily.sunset[0];
  if (!sunriseStr || !sunsetStr) return null;

  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);
  const now = new Date();
  const daytime = now >= sunrise && now <= sunset;

  const sunriseMinutes = sunrise.getHours() * 60 + sunrise.getMinutes();
  const sunsetMinutes = sunset.getHours() * 60 + sunset.getMinutes();
  const totalMinutes = sunsetMinutes - sunriseMinutes;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const progress = daytime ? Math.max(0, Math.min(1, (nowMinutes - sunriseMinutes) / totalMinutes)) : 0;

  const cx = 100, cy = 90, rx = 80, ry = 70;
  const startX = cx - rx, endX = cx + rx;
  const currentX = cx + rx * Math.cos(Math.PI * (1 - progress));
  const currentY = cy - ry * Math.sin(Math.PI * progress);

  return (
    <div className="sun-arc-inline">
      <div className="sun-arc-header">
        <span>🌅 {formatLocalTime(sunriseStr)}</span>
        <span className="sun-arc-label">{daytime ? "☀️ Sun is up" : "🌙 Night time"}</span>
        <span>🌇 {formatLocalTime(sunsetStr)}</span>
      </div>
      <svg viewBox="0 0 200 110" className="sun-arc-svg">
        <path d={`M ${startX} ${cy} A ${rx} ${ry} 0 0 1 ${endX} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
        {daytime && (
          <>
            <path d={`M ${startX} ${cy} A ${rx} ${ry} 0 0 1 ${currentX} ${currentY}`} fill="none" stroke="var(--accent)" strokeWidth="2" />
            <circle cx={currentX} cy={currentY} r="6" fill="#fbbf24" filter="url(#sunGlow)" />
            <circle cx={currentX} cy={currentY} r="4" fill="#fbbf24" />
          </>
        )}
        {!daytime && <circle cx={cx} cy={cy - 20} r="5" fill="var(--text-muted)" opacity="0.3" />}
        <defs>
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      {daytime && (
        <div className="sun-arc-progress">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{Math.round(progress * 100)}% of daylight elapsed</span>
        </div>
      )}
    </div>
  );
});

export default SunArc;
