import { memo } from "react";
import { convertTemp, convertWind, calcHeatIndex, calcWindChill, calcHumidex, calcSunburnTime, getVisibilityContext, getWindPowerContext, getDewPointComfort, getPressureTrend, getMoonPhase, MOON_PHASES } from "../../utils.js";

const FunStats = memo(function FunStats({ data, units }) {
  const temp = data.current.temperature_2m;
  const humidity = data.current.relative_humidity_2m;
  const pressure = data.current.surface_pressure;
  const dewPoint = data.current.dew_point_2m;
  const wind = data.current.wind_speed_10m;
  const uv = data.daily?.uv_index_max?.[0] ?? 0;
  const visibility = data.current.visibility;

  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);
  const humidex = calcHumidex(temp, dewPoint);
  const sunburnTime = calcSunburnTime(uv);
  const visContext = getVisibilityContext(visibility);
  const windCtx = getWindPowerContext(wind);
  const dpComfort = getDewPointComfort(dewPoint);
  const pressureTrend = getPressureTrend(pressure);

  const moonPhase = getMoonPhase();
  const moonInfo = MOON_PHASES[moonPhase] || MOON_PHASES[0];

  const windKmh = convertWind(wind, "kmh");
  const windMph = convertWind(wind, "mph");

  const airMass = 1.225 * (temp + 273.15) / 288.15;

  const stats = [];

  if (heatIndex !== null) {
    stats.push({
      emoji: "🔥",
      value: `${heatIndex}°${units.temp === "F" ? "F" : "C"}`,
      label: "Heat Index",
      detail: `Feels hotter than ${Math.round(temp)}° due to humidity`,
    });
  }

  if (windChill !== null) {
    stats.push({
      emoji: "🥶",
      value: `${windChill}°${units.temp === "F" ? "F" : "C"}`,
      label: "Wind Chill",
      detail: `Wind makes it feel ${Math.abs(temp - windChill)}° colder`,
    });
  }

  if (humidex !== null) {
    stats.push({
      emoji: "💧",
      value: `${humidex}`,
      label: "Humidex",
      detail: dpComfort ? `${dpComfort.emoji} ${dpComfort.text}` : `Dew point: ${Math.round(dewPoint)}°C`,
    });
  }

  if (sunburnTime && uv > 0) {
    stats.push({
      emoji: "☀️",
      value: `~${sunburnTime} min`,
      label: "Sunburn Time",
      detail: `UV ${uv} — unprotected skin burns in ${sunburnTime < 15 ? "under" : "about"} ${sunburnTime} min`,
    });
  }

  if (visContext) {
    stats.push({
      emoji: "👁️",
      value: `${visContext.km} km`,
      label: "Visibility",
      detail: `${visContext.fields} football fields — ${visContext.quality.toLowerCase()}`,
    });
  }

  stats.push({
    emoji: windCtx.emoji,
    value: `${windKmh} km/h`,
    label: "Wind Power",
    detail: `${windCtx.text} — ${windCtx.action}`,
  });

  if (dpComfort) {
    stats.push({
      emoji: dpComfort.emoji,
      value: `${Math.round(dewPoint)}°C`,
      label: "Dew Point",
      detail: `${dpComfort.level} — ${dpComfort.text}`,
    });
  }

  if (pressureTrend) {
    stats.push({
      emoji: pressureTrend.emoji,
      value: `${Math.round(pressure)} hPa`,
      label: "Pressure",
      detail: `${pressureTrend.dir} — ${pressureTrend.text}`,
    });
  }

  const soundSpeed = 331.3 + 0.606 * temp;
  stats.push({
    emoji: "🔊",
    value: `${Math.round(soundSpeed)} m/s`,
    label: "Sound Speed",
    detail: `Sound travels ${Math.round(soundSpeed)} m/s at ${Math.round(temp)}°C`,
  });

  const airWeight = Math.round(airMass * 100);
  stats.push({
    emoji: "⚖️",
    value: `${airWeight}g`,
    label: "Air Density",
    detail: `A room of air weighs ~${Math.round(airWeight / 1000 * 10)}kg today`,
  });

  const moonVisibility = moonPhase === 0 ? "Darkest — perfect for stars" : moonPhase === 4 ? "Brightest moonlight" : `${moonPhase > 4 ? "Waning" : "Waxing"} — ${Math.round((moonPhase <= 4 ? moonPhase : 7 - moonPhase) / 4 * 100)}% lit`;
  stats.push({
    emoji: moonInfo.emoji,
    value: moonInfo.name,
    label: "Moon Phase",
    detail: moonVisibility,
  });

  const paperPlaneDist = windKmh > 10 ? Math.round(windKmh * 0.8) : Math.round(5 + Math.random() * 10);
  if (windKmh >= 8) {
    stats.push({
      emoji: "✈️",
      value: `~${paperPlaneDist}m`,
      label: "Paper Plane",
      detail: `A paper plane would fly ~${paperPlaneDist}m in this wind`,
    });
  }

  return (
    <div className="fun-stats glass-card fade-in">
      <div className="section-title">🎲 Fun Weather Stats</div>
      <div className="fun-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="fun-stat-card">
            <div className="fun-stat-emoji">{s.emoji}</div>
            <div className="fun-stat-value">{s.value}</div>
            <div className="fun-stat-label">{s.label}</div>
            <div className="fun-stat-detail">{s.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default FunStats;
