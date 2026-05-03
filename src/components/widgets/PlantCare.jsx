import { memo } from "react";
import { convertTemp } from "../../utils.js";

const PlantCare = memo(function PlantCare({ data, units }) {
  const temp = data.current.temperature_2m;
  const precip = data.hourly?.precipitation_probability?.[0] ?? 0;
  const code = data.current.weather_code;
  const wind = data.current.wind_speed_10m;

  const isHot = temp >= 30;
  const isCold = temp <= 5;
  const isRainy = precip >= 60;
  const isWindy = wind >= 40;
  const isClear = code <= 1;

  const tips = [];
  if (isHot) tips.push({ emoji: "💧", text: "Water deeply — soil dries fast in heat" });
  if (isCold) tips.push({ emoji: "🧤", text: "Protect tender plants from frost" });
  if (isRainy) tips.push({ emoji: "🌧️", text: "Skip watering — nature handles it" });
  if (isWindy) tips.push({ emoji: "🏠", text: "Move potted plants to shelter" });
  if (isClear && !isHot) tips.push({ emoji: "☀️", text: "Great day for photosynthesis" });
  if (tips.length === 0) tips.push({ emoji: "🌱", text: "All good — keep up regular care" });

  return (
    <div className="glass-card detail-card detail-plant">
      <div className="detail-icon">🌱</div>
      <div className="detail-label">Plant Care</div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center" }}>
        {tips[0].emoji} {tips[0].text}
      </div>
    </div>
  );
});

export default PlantCare;
