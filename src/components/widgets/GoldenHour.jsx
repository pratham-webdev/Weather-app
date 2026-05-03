import { useState, useEffect, memo } from "react";
import { calcSunElevation } from "../../utils.js";

const GoldenHour = memo(function GoldenHour({ data }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);

  const sunrise = new Date(data.daily.sunrise[0]);
  const sunset = new Date(data.daily.sunset[0]);
  const goldenStart = new Date(sunset.getTime() - 3600000);
  const goldenEnd = new Date(sunset.getTime());
  const morningGoldenStart = new Date(sunrise.getTime());
  const morningGoldenEnd = new Date(sunrise.getTime() + 1800000);

  const current = new Date(now);
  const isGolden = (current >= goldenStart && current <= goldenEnd) || (current >= morningGoldenStart && current <= morningGoldenEnd);
  const isEvening = current >= goldenStart && current <= goldenEnd;

  let remaining = "";
  if (isEvening) remaining = `${Math.round((goldenEnd - current) / 60000)}min left`;
  else if (current < goldenStart && current > morningGoldenEnd) remaining = `${Math.round((goldenStart - current) / 60000)}min until`;
  else if (current < morningGoldenEnd) remaining = "Active now!";

  const elev = calcSunElevation(current, data.latitude, data.longitude, data.timezone);

  return (
    <div className="glass-card detail-card detail-golden-hour">
      <div className="detail-icon">📸</div>
      <div className="detail-label">Golden Hour</div>
      <div className={isGolden ? "golden-active" : ""}>
        {isGolden ? "✨ Golden hour now!" : `🌅 ${remaining}`}
      </div>
      {isGolden && remaining && <div className="golden-remaining">{remaining}</div>}
    </div>
  );
});

export default GoldenHour;
