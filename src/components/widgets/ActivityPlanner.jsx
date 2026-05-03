import { memo, useMemo } from "react";
import { ACTIVITIES, getActivityScore, getActivityReason, getActivityTimeWindow, getWhatToBring, getActivityWarnings } from "../../utils.js";
import WalkForecast from "./WalkForecast.jsx";

const CircularScore = ({ score, size = 64 }) => {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 32 32)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="32" y="34" textAnchor="middle" fontSize="15" fontWeight="800" fill={color}>{score}</text>
    </svg>
  );
};

const ActivityCard = ({ a }) => (
  <div className={`activity-card-flat activity-${a.reason.actionable.toLowerCase()}`}>
    <div className="activity-card-top">
      <span className="activity-emoji">{a.emoji}</span>
      <CircularScore score={a.score} size={48} />
    </div>
    <div className="activity-name">{a.name}</div>
    <div className="activity-reason-text">{a.reason.text}</div>
    <div className="activity-card-meta">
      <span>🕐 {a.timeWindow}</span>
    </div>
  </div>
);

const OUTLOOKS = {
  great: { emoji: "🌤️", message: "Great day for outdoor activities — make the most of it!", variant: "great" },
  mixed: { emoji: "🌦️", message: "Mixed conditions — pick your timing carefully", variant: "mixed" },
  poor: { emoji: "⚠️", message: "Minimize outdoor activity today — conditions are poor", variant: "poor" },
};

const ActivityPlanner = memo(function ActivityPlanner({ data, units }) {
  const temp = data.current.temperature_2m;
  const wind = data.current.wind_speed_10m;
  const precip = data.hourly?.precipitation_probability?.[0] ?? 0;
  const code = data.current.weather_code;
  const humidity = data.current.relative_humidity_2m;
  const uv = data.daily?.uv_index_max?.[0] ?? 0;
  const daytime = (() => {
    if (!data?.daily?.sunrise?.[0] || !data?.daily?.sunset?.[0]) return true;
    return new Date() >= new Date(data.daily.sunrise[0]) && new Date() <= new Date(data.daily.sunset[0]);
  })();

  const scored = useMemo(() => ACTIVITIES.map(a => {
    const score = getActivityScore(a.key, code, temp, wind, precip, humidity, uv, daytime);
    const reason = getActivityReason(a.key, code, temp, wind, precip, humidity, uv, daytime);
    const timeWindow = getActivityTimeWindow(data.hourly, a.key, daytime, code);
    const bring = getWhatToBring(a.key, code, temp, wind, precip, humidity, uv, daytime);
    return { ...a, score, reason, timeWindow, bring };
  }).sort((a, b) => b.score - a.score), [code, temp, wind, precip, humidity, uv, daytime, data.hourly]);

  const topPick = scored[0];
  const goActivities = scored.filter(a => a.score >= 40);
  const skipActivities = scored.filter(a => a.score < 40);

  const outlook = useMemo(() => {
    const greatCount = scored.filter(a => a.score >= 70).length;
    const skipCount = scored.filter(a => a.score < 40).length;
    if (greatCount >= 3) return OUTLOOKS.great;
    if (skipCount >= 4) return OUTLOOKS.poor;
    return OUTLOOKS.mixed;
  }, [scored]);

  const globalWarnings = useMemo(() => {
    const seen = new Set();
    const warnings = [];
    for (const a of scored) {
      const wList = getActivityWarnings(a.key, code, temp, wind, precip, humidity, uv, daytime);
      for (const w of wList) {
        if (w.severity === "info") continue;
        const topic = w.text.split("—")[0].trim().split(",")[0].trim();
        if (!seen.has(topic)) {
          seen.add(topic);
          warnings.push(w);
        }
      }
    }
    return warnings.sort((a, b) => {
      const order = { danger: 0, warn: 1, info: 2 };
      return (order[a.severity] ?? 2) - (order[b.severity] ?? 2);
    }).slice(0, 8);
  }, [scored, code, temp, wind, precip, humidity, uv, daytime]);

  return (
    <div className="glass-card activity-section">
      <div className="section-title">🏃 Activity Planner</div>

      <WalkForecast data={data} units={units} />

      <div className={`activity-outlook-banner outlook-${outlook.variant}`}>
        <span className="activity-outlook-emoji">{outlook.emoji}</span>
        <span className="activity-outlook-message">{outlook.message}</span>
      </div>

      {globalWarnings.length > 0 && (
        <div className="activity-risks-bar" role="alert" aria-label="Weather warnings and risks">
          {globalWarnings.map((w, i) => (
            <span key={i} className={`activity-risk-pill risk-${w.severity}`}>
              {w.icon} {w.text}
            </span>
          ))}
        </div>
      )}

      <div className="activity-top-pick">
        <div className="activity-top-badge">⭐ Best Pick Today</div>
        <div className="activity-top-content">
          <div className="activity-top-left">
            <div className="activity-top-emoji">{topPick.emoji}</div>
            <div className="activity-top-name">{topPick.name}</div>
          </div>
          <CircularScore score={topPick.score} size={72} />
          <div className="activity-top-reason">{topPick.reason.text}</div>
          <div className="activity-top-meta">
            <span className="activity-top-time">🕐 Best: {topPick.timeWindow}</span>
          </div>
          {topPick.bring.length > 0 && (
            <div className="activity-top-bring">
              <span className="activity-bring-label">What to bring:</span>
              <div className="activity-bring-items">
                {topPick.bring.map((item, i) => (
                  <span key={i} className="activity-bring-tag">{item.emoji} {item.label}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="activity-grid">
        {goActivities.filter(a => a.key !== topPick.key).map(a => (
          <ActivityCard key={a.key} a={a} />
        ))}
      </div>

      {skipActivities.length > 0 && (
        <div className="activity-skip-divider">
          <span>Not recommended right now</span>
        </div>
      )}
      {skipActivities.length > 0 && (
        <div className="activity-skip-grid">
          {skipActivities.map(a => (
            <ActivityCard key={a.key} a={a} />
          ))}
        </div>
      )}
    </div>
  );
});

export default ActivityPlanner;
