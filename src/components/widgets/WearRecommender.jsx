import { useState, memo } from "react";
import { WEAR_ITEMS, WEAR_RULES } from "../../utils.js";

const WearRecommender = memo(function WearRecommender({ data, units }) {
  const [expanded, setExpanded] = useState(false);
  const temp = data.current.temperature_2m;
  const wind = data.current.wind_speed_10m;
  const precip = data.hourly?.precipitation_probability?.[0] ?? 0;
  const code = data.current.weather_code;
  const uv = data.daily?.uv_index_max?.[0] ?? 0;

  const items = WEAR_ITEMS.filter(w => WEAR_RULES[w.key](temp, wind, code, precip, uv));

  return (
    <div className="glass-card detail-card detail-wear">
      <div className="detail-icon">👔</div>
      <div className="detail-label">What to Wear</div>
      <div className="wear-items">
        {items.slice(0, 3).map(w => <span key={w.key} className="wear-item">{w.label}</span>)}
      </div>
      {items.length > 3 && (
        <button className="wear-toggle" onClick={() => setExpanded(e => !e)}>
          {expanded ? "Show less" : `+${items.length - 3} more`}
        </button>
      )}
      {expanded && (
        <div className="wear-items" style={{ marginTop: "6px" }}>
          {items.slice(3).map(w => <span key={w.key} className="wear-item">{w.label}</span>)}
        </div>
      )}
    </div>
  );
});

export default WearRecommender;
