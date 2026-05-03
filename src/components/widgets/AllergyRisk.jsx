import { memo } from "react";

const AllergyRisk = memo(function AllergyRisk({ data }) {
  const code = data.current.weather_code;
  const wind = data.current.wind_speed_10m;
  const humidity = data.current.relative_humidity_2m;
  const isRainy = code >= 51 && code <= 82;
  const isWindy = wind >= 25;
  const isDry = humidity < 40;

  let level = "Low", colorClass = "allergy-low";
  if (isDry && isWindy) { level = "High"; colorClass = "allergy-high"; }
  else if (isWindy || isDry) { level = "Moderate"; colorClass = "allergy-moderate"; }
  if (isRainy) { level = "Low"; colorClass = "allergy-low"; }

  const advice = level === "High" ? "Keep windows closed, take antihistamines" : level === "Moderate" ? "Moderate outdoor activity" : "Enjoy the outdoors!";

  return (
    <div className="glass-card detail-card detail-allergy">
      <div className="detail-icon">🤧</div>
      <div className="detail-label">Allergy Risk</div>
      <div className={`allergy-level ${colorClass}`}>{level}</div>
      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "center" }}>{advice}</div>
    </div>
  );
});

export default AllergyRisk;
