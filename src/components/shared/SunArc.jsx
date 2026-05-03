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

  const extractMinutes = (iso) => {
    const time = iso.split("T")[1];
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const nowParts = new Intl.DateTimeFormat("en-US", { timeZone: data.timezone, hour: "numeric", minute: "numeric", hour12: false }).formatToParts(now);
  const nowH = parseInt(nowParts.find(p => p.type === "hour").value, 10);
  const nowM = parseInt(nowParts.find(p => p.type === "minute").value, 10);
  const nowMinutes = nowH * 60 + nowM;

  const sunriseMinutes = extractMinutes(sunriseStr);
  const sunsetMinutes = extractMinutes(sunsetStr);
  const totalDayMinutes = sunsetMinutes - sunriseMinutes;
  const totalNightMinutes = (24 * 60) - totalDayMinutes;

  let dayProgress = 0;
  let nightProgress = 0;

  if (daytime && totalDayMinutes > 0) {
    dayProgress = Math.max(0, Math.min(1, (nowMinutes - sunriseMinutes) / totalDayMinutes));
  } else if (!daytime) {
    if (nowMinutes >= sunsetMinutes) {
      nightProgress = Math.max(0, Math.min(1, (nowMinutes - sunsetMinutes) / totalNightMinutes));
    } else {
      nightProgress = Math.max(0, Math.min(1, ((nowMinutes + 24 * 60) - sunsetMinutes) / totalNightMinutes));
    }
  }

  const cx = 100, cy = 90, rx = 80, ry = 70;
  const startX = cx - rx, endX = cx + rx;
  const progress = daytime ? dayProgress : nightProgress;
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
        {!daytime && (
          <>
            <circle cx={currentX} cy={currentY} r="5" fill="var(--text-muted)" opacity="0.6" />
            <circle cx={currentX} cy={currentY} r="3" fill="var(--text-muted)" opacity="0.4" />
          </>
        )}
        <defs>
          <filter id="sunGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      {daytime && (
        <div className="sun-arc-progress">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{Math.round(dayProgress * 100)}% of daylight elapsed</span>
        </div>
      )}
      {!daytime && (
        <div className="sun-arc-progress">
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{Math.round(nightProgress * 100)}% of night elapsed</span>
        </div>
      )}
    </div>
  );
});

export default SunArc;
