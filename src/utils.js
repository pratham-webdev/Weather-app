export const MAJOR_CITIES = [
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.0060 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "San Francisco", country: "United States", lat: 37.7749, lon: -122.4194 },
  { name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050 },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
];

export const WMO_CODES = {
  0: { label: "Clear Sky", type: "clear", emoji: "☀️" },
  1: { label: "Mainly Clear", type: "clear", emoji: "⛅" },
  2: { label: "Partly Cloudy", type: "cloudy", emoji: "⛅" },
  3: { label: "Overcast", type: "cloudy", emoji: "☁️" },
  45: { label: "Foggy", type: "foggy", emoji: "🌫️" },
  48: { label: "Rime Fog", type: "foggy", emoji: "🌫️" },
  51: { label: "Light Drizzle", type: "rainy", emoji: "🌦️" },
  53: { label: "Drizzle", type: "rainy", emoji: "🌧️" },
  55: { label: "Heavy Drizzle", type: "rainy", emoji: "🌧️" },
  61: { label: "Light Rain", type: "rainy", emoji: "🌧️" },
  63: { label: "Rain", type: "rainy", emoji: "🌧️" },
  65: { label: "Heavy Rain", type: "rainy", emoji: "🌧️" },
  71: { label: "Light Snow", type: "snowy", emoji: "❄️" },
  73: { label: "Snow", type: "snowy", emoji: "❄️" },
  75: { label: "Heavy Snow", type: "snowy", emoji: "❄️" },
  77: { label: "Snow Grains", type: "snowy", emoji: "❄️" },
  80: { label: "Rain Showers", type: "rainy", emoji: "🌦️" },
  81: { label: "Showers", type: "rainy", emoji: "🌦️" },
  82: { label: "Heavy Showers", type: "rainy", emoji: "🌧️" },
  85: { label: "Snow Showers", type: "snowy", emoji: "🌨️" },
  86: { label: "Heavy Snow Showers", type: "snowy", emoji: "🌨️" },
  95: { label: "Thunderstorm", type: "stormy", emoji: "⛈️" },
  96: { label: "Thunderstorm w/ Hail", type: "stormy", emoji: "⛈️" },
  99: { label: "Thunderstorm w/ Heavy Hail", type: "stormy", emoji: "⛈️" },
};

export const GRADIENTS = {
  "clear-day": "var(--gradient-sunny)",
  "clear-night": "var(--gradient-night-clear)",
  "cloudy-day": "var(--gradient-cloudy)",
  "cloudy-night": "var(--gradient-night-cloudy)",
  "rainy-day": "var(--gradient-rainy)",
  "rainy-night": "var(--gradient-night-rainy)",
  "snowy-day": "var(--gradient-snowy)",
  "snowy-night": "var(--gradient-night-snowy)",
  "stormy-day": "var(--gradient-stormy)",
  "stormy-night": "var(--gradient-night-stormy)",
  "foggy-day": "var(--gradient-foggy)",
  "foggy-night": "var(--gradient-night-foggy)",
};

export const MOON_PHASES = {
  0: { name: "New Moon", emoji: "🌑" },
  1: { name: "Waxing Crescent", emoji: "🌒" },
  2: { name: "First Quarter", emoji: "🌓" },
  3: { name: "Waxing Gibbous", emoji: "🌔" },
  4: { name: "Full Moon", emoji: "🌕" },
  5: { name: "Waning Gibbous", emoji: "🌖" },
  6: { name: "Last Quarter", emoji: "🌗" },
  7: { name: "Waning Crescent", emoji: "🌘" },
};

export function getBgGradient(code, daytime) {
  const info = getWeatherInfo(code);
  const key = `${info.type}-${daytime ? "day" : "night"}`;
  return GRADIENTS[key] || (daytime ? "var(--gradient-cloudy)" : "var(--gradient-night-cloudy)");
}

export function getWeatherInfo(code) {
  return WMO_CODES[code] || { label: "Unknown", type: "cloudy", emoji: "🌥️" };
}

export function convertTemp(c, unit) {
  if (unit === "F") return Math.round(c * 9 / 5 + 32);
  return Math.round(c);
}

export function convertWind(kmh, unit) {
  if (unit === "mph") return Math.round(kmh * 0.621371);
  return Math.round(kmh);
}

export function convertVisibility(meters) {
  if (meters == null || isNaN(meters)) return "N/A";
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  }
  return `${Math.round(meters)} m`;
}

export function windDirection(degrees) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16];
}

export function formatLocalTime(isoString) {
  const time = isoString.split("T")[1];
  if (!time) return "--";
  const parts = time.split(":");
  const h = parseInt(parts[0], 10);
  const m = parts[1] || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function formatLocalDate(isoString, options) {
  const datePart = isoString.split("T")[0];
  if (!datePart) return "--";
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", options);
}

export function getCurrentTimeInTimezone(timezone, useBrowserTz) {
  if (!timezone) return { dateStr: "", timeStr: "" };
  const now = new Date();
  const tz = useBrowserTz ? undefined : timezone;
  const opts = tz ? { timeZone: tz } : {};
  const fmt = new Intl.DateTimeFormat("en-US", { ...opts, hour: "numeric", minute: "2-digit", hour12: true });
  const dateFmt = new Intl.DateTimeFormat("en-US", { ...opts, weekday: "long", month: "long", day: "numeric" });
  return { dateStr: dateFmt.format(now), timeStr: fmt.format(now) };
}

export function getCurrentHourInTimezone(timezone, useBrowserTz) {
  const now = new Date();
  if (useBrowserTz) return now.getHours();
  if (!timezone) return now.getHours();
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).formatToParts(now);
  return parseInt(parts.find(p => p.type === "hour").value, 10);
}

export function isDaytime(data) {
  if (!data?.daily?.sunrise?.[0] || !data?.daily?.sunset?.[0]) return true;
  const sunriseTime = new Date(data.daily.sunrise[0]);
  const sunsetTime = new Date(data.daily.sunset[0]);
  const now = new Date();
  return now >= sunriseTime && now <= sunsetTime;
}

export function trackFeature(name) {
  try {
    const data = JSON.parse(localStorage.getItem("weather-telemetry") || "{}");
    data[name] = (data[name] || 0) + 1;
    data._last = Date.now();
    localStorage.setItem("weather-telemetry", JSON.stringify(data));
  } catch {}
}

export function calcSunElevation(date, lat, lon, timezone) {
  const now = date || new Date();
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localParts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", second: "numeric", hour12: false }).formatToParts(now);
  const h = parseInt(localParts.find(p => p.type === "hour").value, 10);
  const m = parseInt(localParts.find(p => p.type === "minute").value, 10);
  const s = parseInt(localParts.find(p => p.type === "second").value, 10);
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const hourAngle = 15 * (h + m / 60 + s / 3600 - 12);
  const latRad = (lat * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const haRad = (hourAngle * Math.PI) / 180;
  const sinElev = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  return Math.asin(sinElev) * (180 / Math.PI);
}

export function getMoonPhase(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  let c = 0, e = 0, jd = 0, b = 0;
  if (month < 3) { c = 365.25 * (year - 1); e = 30.6001 * (month + 13); }
  else { c = 365.25 * year; e = 30.6001 * (month + 1); }
  jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  b = Math.floor(jd);
  const fraction = jd - b;
  return fraction;
}

export function getWeatherMood(code, temp, wind, humidity) {
  const isStormy = code >= 95;
  const isRainy = code >= 51 && code <= 82;
  const isSnowy = code >= 71 && code <= 86;
  const isClear = code <= 1;
  const isHot = temp >= 35;
  const isCold = temp <= 0;
  const isWindy = wind >= 50;

  if (isStormy) return { tag: "Stormy vibes ⛈️", emoji: "⛈️" };
  if (isRainy && isWindy) return { tag: "Weather for staying in 🏠", emoji: "🌧️" };
  if (isSnowy) return { tag: "Winter wonderland ❄️", emoji: "❄️" };
  if (isClear && temp >= 20 && temp <= 30) return { tag: "Perfect weather! ☀️", emoji: "✨" };
  if (isClear && isHot) return { tag: "Scorching hot 🔥", emoji: "🥵" };
  if (isClear && isCold) return { tag: "Crisp and clear 🧊", emoji: "🥶" };
  if (isRainy) return { tag: "Cozy rain day 🌧️", emoji: "☕" };
  if (humidity >= 85) return { tag: "Feels like a sauna 🧖", emoji: "💦" };
  return { tag: "Another day, another forecast 🌤️", emoji: "🤷" };
}

export function getActivityScore(activity, code, temp, wind, precip, humidity, uv, daytime) {
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);

  if (heatIndex !== null && heatIndex > 40) return 0;
  if (windChill !== null && windChill < -25) return 0;
  if (temp > 42) return 0;
  if (temp < -20) return 0;

  let score = 50;

  if (code >= 95) score -= 40;
  else if (code >= 80) score -= 20;
  else if (code >= 61) score -= 10;
  else if (code <= 1) score += 10;

  if (temp >= 15 && temp <= 28) score += 15;
  else if (temp >= 10 && temp < 15) score += 5;
  else if (temp > 28 && temp <= 32) score += 5;

  if (temp > 35) score -= 30;
  else if (temp > 32) score -= 15;
  else if (temp > 30) score -= 5;

  if (temp < -15) score -= 40;
  else if (temp < -5) score -= 25;
  else if (temp < 0) score -= 15;

  if (wind >= 50) score -= 25;
  else if (wind >= 40) score -= 15;
  else if (wind >= 25) score -= 5;
  else if (wind < 10) score += 5;

  if (precip >= 70) score -= 25;
  else if (precip >= 50) score -= 15;
  else if (precip >= 30) score -= 5;

  if (windChill !== null && windChill < -10) score -= 15;
  if (heatIndex !== null && heatIndex > 35) score -= 10;

  switch (activity) {
    case "running":
      if (temp > 38) score -= 25;
      else if (temp > 35) score -= 20;
      else if (temp > 30) score -= 15;
      if (humidity > 85) score -= 20;
      else if (humidity > 75) score -= 10;
      if (temp < -10) score -= 15;
      if (code >= 71 && code <= 86) score -= 15;
      break;
    case "hiking":
      if (temp > 37) score -= 25;
      else if (temp > 32) score -= 15;
      if (!daytime) score -= 15;
      if (uv >= 9) score -= 20;
      else if (uv >= 7) score -= 10;
      if (temp < -10) score -= 25;
      else if (temp < 0) score -= 10;
      break;
    case "cycling":
      if (temp > 38) score -= 15;
      else if (temp > 35) score -= 10;
      if (wind >= 35) score -= 20;
      else if (wind >= 30) score -= 15;
      if (!daytime) score -= 10;
      if (temp < -10) score -= 30;
      else if (temp < -5) score -= 15;
      if (code >= 71 && code <= 86) score -= 20;
      break;
    case "beach":
      if (temp > 40) score -= 30;
      if (temp < 28 && temp > 25) score -= 10;
      if (temp < 25) score -= 25;
      if (precip >= 30) score -= 20;
      if (uv < 5 && temp < 30) score -= 15;
      if (wind >= 40) score -= 15;
      break;
    case "photography":
      if (temp > 35) score -= 10;
      if (temp < -10) score -= 15;
      if (precip >= 50) score -= 10;
      if (code <= 1 || (code >= 45 && code <= 48)) score += 10;
      break;
    case "stargazing":
      if (daytime) score -= 50;
      if (code >= 2) score -= 20;
      if (code === 0) score += 15;
      if (temp < -15) score -= 15;
      if (wind >= 30) score -= 10;
      break;
    default:
      break;
  }

  return Math.max(0, Math.min(100, score));
}

export function getActivityWarnings(activity, code, temp, wind, precip, humidity, uv, daytime) {
  const warnings = [];
  const heatIndex = calcHeatIndex(temp, humidity);
  const windChill = calcWindChill(temp, wind);

  if (heatIndex !== null && heatIndex > 40) warnings.push({ icon: "🌡️", text: `Heat index ${heatIndex}°C — extreme danger`, severity: "danger" });
  else if (heatIndex !== null && heatIndex > 35) warnings.push({ icon: "🔥", text: `Heat index ${heatIndex}°C — feels much hotter`, severity: "warn" });

  if (windChill !== null && windChill < -15) warnings.push({ icon: "🥶", text: `Wind chill ${windChill}°C — frostbite risk`, severity: "danger" });
  else if (windChill !== null && windChill < -5) warnings.push({ icon: "❄️", text: `Wind chill ${windChill}°C — very cold`, severity: "warn" });

  if (temp > 40) warnings.push({ icon: "🌡️", text: `${Math.round(temp)}°C — heatstroke risk`, severity: "danger" });
  else if (temp > 35) warnings.push({ icon: "🔥", text: `${Math.round(temp)}°C — dangerously hot`, severity: "danger" });
  else if (temp > 30) warnings.push({ icon: "☀️", text: `${Math.round(temp)}°C — hot, stay hydrated`, severity: "warn" });

  if (temp < -15) warnings.push({ icon: "🥶", text: `${Math.round(temp)}°C — extreme cold`, severity: "danger" });
  else if (temp < -5) warnings.push({ icon: "❄️", text: `${Math.round(temp)}°C — very cold`, severity: "danger" });
  else if (temp < 0) warnings.push({ icon: "🧊", text: `${Math.round(temp)}°C — below freezing`, severity: "warn" });

  if (uv >= 9) warnings.push({ icon: "☀️", text: `UV ${uv} — extreme, sunburn in <10 min`, severity: "danger" });
  else if (uv >= 7) warnings.push({ icon: "☀️", text: `UV ${uv} — high, sunburn in ~15 min`, severity: "warn" });
  else if (uv >= 5) warnings.push({ icon: "☀️", text: `UV ${uv} — moderate protection needed`, severity: "info" });

  if (humidity > 90) warnings.push({ icon: "💧", text: `Humidity ${Math.round(humidity)}% — oppressive`, severity: "danger" });
  else if (humidity > 80) warnings.push({ icon: "💧", text: `Humidity ${Math.round(humidity)}% — very humid`, severity: "warn" });

  if (precip >= 70) warnings.push({ icon: "🌧️", text: `${precip}% chance of rain`, severity: "danger" });
  else if (precip >= 40) warnings.push({ icon: "🌦️", text: `${precip}% chance of rain`, severity: "warn" });

  if (wind >= 50) warnings.push({ icon: "💨", text: `${Math.round(wind)} km/h — dangerous gusts`, severity: "danger" });
  else if (wind >= 35) warnings.push({ icon: "💨", text: `${Math.round(wind)} km/h — strong winds`, severity: "warn" });

  if (code >= 95) warnings.push({ icon: "⛈️", text: "Thunderstorm — seek shelter", severity: "danger" });
  if (code >= 61 && code <= 65) warnings.push({ icon: "🌧️", text: "Rain conditions", severity: "warn" });
  if (code >= 71 && code <= 86) warnings.push({ icon: "❄️", text: "Snow conditions", severity: "warn" });
  if (code >= 45 && code <= 48) warnings.push({ icon: "🌫️", text: "Fog — poor visibility", severity: "warn" });

  if (!daytime && ["hiking", "cycling", "beach"].includes(activity)) warnings.push({ icon: "🌙", text: "Dark outside — extra caution", severity: "warn" });

  return warnings;
}

export function getActivityReason(activity, code, temp, wind, precip, humidity, uv, daytime) {
  const score = getActivityScore(activity, code, temp, wind, precip, humidity, uv, daytime);
  const warnings = getActivityWarnings(activity, code, temp, wind, precip, humidity, uv, daytime);
  const info = getWeatherInfo(code);
  const conditions = `${Math.round(temp)}°${precip > 0 ? `, ${precip}% rain` : ""}${wind > 15 ? `, ${Math.round(wind)} km/h wind` : ""}`;

  if (score === 0) {
    const heatIndex = calcHeatIndex(temp, humidity);
    const windChill = calcWindChill(temp, wind);
    if (heatIndex !== null && heatIndex > 40) return { text: "Heat index exceeds 40°C — extremely dangerous outdoors", actionable: "Skip", detail: conditions, warnings };
    if (windChill !== null && windChill < -25) return { text: "Wind chill below -25°C — frostbite in minutes", actionable: "Skip", detail: conditions, warnings };
    if (temp > 40) return { text: `${Math.round(temp)}°C is dangerously hot — avoid outdoor exertion`, actionable: "Skip", detail: conditions, warnings };
    if (temp < -20) return { text: `${Math.round(temp)}°C is dangerously cold — risk of frostbite`, actionable: "Skip", detail: conditions, warnings };
    if (code >= 95) return { text: "Thunderstorm — outdoor activities are unsafe", actionable: "Skip", detail: conditions, warnings };
    return { text: "Conditions are extremely hazardous right now", actionable: "Skip", detail: conditions, warnings };
  }

  if (score < 20) {
    const reasons = {
      running: temp > 32 ? `Too hot at ${Math.round(temp)}°C — high heat exhaustion risk` : temp < -5 ? `Too cold at ${Math.round(temp)}°C` : `Too extreme for running right now`,
      hiking: !daytime ? "Dark outside — trails are unsafe" : temp > 32 ? `Heat makes hiking dangerous at ${Math.round(temp)}°C` : precip >= 50 ? "Heavy rain — trails will be slippery and flooded" : "Conditions unsafe for hiking",
      cycling: wind >= 35 ? `Strong winds at ${Math.round(wind)} km/h make cycling dangerous` : temp < -10 ? "Frozen roads — high risk of falls" : "Dangerous cycling conditions",
      beach: temp > 38 ? "Extreme heat — beach would be unbearable" : temp < 15 ? "Too cold for any beach activity" : "Not beach weather at all",
      photography: precip >= 50 ? "Heavy rain would damage equipment" : "Poor lighting and conditions",
      stargazing: code >= 3 ? "Complete cloud cover — nothing visible" : daytime ? "Sun is up — impossible to see stars" : "Visibility too poor tonight",
    };
    return { text: reasons[activity] || "Not recommended", actionable: "Skip", detail: conditions, warnings };
  }
  if (score < 40) {
    const reasons = {
      running: temp > 30 ? `Hot at ${Math.round(temp)}°C — wait for evening when it cools` : temp < 0 ? `Cold at ${Math.round(temp)}°C — dress heavily or try later` : code >= 61 ? `Rain until later — try after the storm` : "Conditions aren't great right now",
      hiking: !daytime ? "Dark outside — wait for sunrise" : precip >= 30 ? "Rain expected — pack waterproof gear" : temp > 30 ? `Warm at ${Math.round(temp)}°C — start early to avoid heat` : "Marginal conditions for hiking",
      cycling: wind >= 30 ? "Strong winds — cycle with caution" : precip >= 30 ? "Slippery roads possible" : temp < 0 ? "Cold — roads may be icy" : "Not ideal but doable",
      beach: temp < 20 ? `Too cold at ${Math.round(temp)}°C — need at least 25°C` : precip >= 30 ? "Rain likely — beach might be empty" : "Beach conditions aren't great",
      photography: "Flat light — not ideal for photos",
      stargazing: code >= 3 ? "Cloud cover blocking the sky" : "Moon or light pollution reducing visibility",
    };
    return { text: reasons[activity] || "Conditions could be better", actionable: "Wait", detail: conditions, warnings };
  }
  if (score < 70) {
    const reasons = {
      running: `Decent run weather — ${conditions}`,
      hiking: `Fair hiking conditions — ${conditions}`,
      cycling: `Rideable — ${conditions}`,
      beach: `Warm enough for a beach visit — ${conditions}`,
      photography: `Interesting skies — could get moody shots`,
      stargazing: `Some clouds but gaps — look for breaks`,
    };
    return { text: reasons[activity] || "Fair conditions", actionable: "OK", detail: conditions, warnings };
  }
  const reasons = {
    running: temp > 28 ? "Warm but great for a run — stay hydrated" : temp < 5 ? "Crisp air — perfect running weather" : "Ideal running conditions right now",
    hiking: uv >= 6 ? "Clear skies — start early to avoid peak UV" : "Beautiful hiking weather — perfect visibility",
    cycling: wind < 15 ? "Almost no wind — effortless cycling" : "Light breeze — refreshing ride",
    beach: temp >= 30 && uv >= 7 ? "Hot and sunny — perfect beach day" : "Warm enough — great for a beach walk",
    photography: info.type === "cloudy" ? "Diffused light — amazing for portraits" : info.type === "foggy" ? "Fog creates moody, atmospheric shots" : "Clear skies — golden hour opportunities",
    stargazing: code === 0 && !daytime ? "Crystal clear skies — exceptional stargazing" : "Mostly clear — good viewing conditions",
  };
  return { text: reasons[activity] || "Great conditions", actionable: "Go", detail: conditions, warnings };
}

export function getActivityTimeWindow(hourly, activity, daytime, code) {
  if (!hourly?.time?.length) return "Now";
  const now = new Date();
  const currentHour = now.getHours();
  const temps = hourly.temperature_2m || [];
  const precips = hourly.precipitation_probability || [];
  const currentTemp = temps[currentHour] ?? 20;
  const isHot = currentTemp > 32;
  const isCold = currentTemp < 0;
  let bestStart = currentHour;
  let bestEnd = currentHour + 1;
  let bestScore = -1;

  for (let i = currentHour; i < Math.min(currentHour + 10, temps.length); i++) {
    const t = temps[i] ?? temps[currentHour];
    const p = precips[i] ?? 0;
    let s = 0;
    if (isHot && i >= 18 && t < 28) s += 40;
    else if (isCold && i >= 6 && t > -5) s += 40;
    else if (t >= 10 && t <= 30) s += 40;
    else if (t >= 5 && t <= 35) s += 20;
    if (p < 20) s += 30;
    else if (p < 50) s += 10;
    if (activity === "stargazing" && i >= 21) s += 30;
    if (activity === "beach" && t >= 25) s += 20;
    if (s > bestScore) { bestScore = s; bestStart = i; bestEnd = i + 2; }
  }

  if (bestStart === currentHour && bestEnd === currentHour + 1) return "Now";
  const fmt = (h) => {
    const hr = h % 24;
    return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}${hr >= 12 ? "PM" : "AM"}`;
  };
  return `${fmt(bestStart)} — ${fmt(bestEnd)}`;
}

export function getWhatToBring(activity, code, temp, wind, precip, humidity, uv, daytime) {
  const items = [];
  if (uv >= 5) items.push({ emoji: "🧴", label: "Sunscreen" });
  if (uv >= 6 && activity !== "stargazing") items.push({ emoji: "🕶️", label: "Sunglasses" });
  if (uv >= 6 && ["hiking", "beach", "running"].includes(activity)) items.push({ emoji: "🧢", label: "Hat" });
  if (temp > 25) items.push({ emoji: "💧", label: "Water" });
  if (temp < 10) items.push({ emoji: "🧥", label: "Layers" });
  if (temp < 5) items.push({ emoji: "🧤", label: "Gloves" });
  if (wind > 20) items.push({ emoji: "🧥", label: "Windbreaker" });
  if (precip >= 30) items.push({ emoji: "☂️", label: "Umbrella" });
  if (precip >= 50) items.push({ emoji: "🧥", label: "Rain jacket" });
  if (code >= 71 && code <= 86) items.push({ emoji: "👢", label: "Waterproof boots" });
  if (activity === "stargazing") items.push({ emoji: "🔦", label: "Flashlight" });
  if (activity === "hiking") items.push({ emoji: "🥾", label: "Good shoes" });
  if (activity === "running" && temp > 20) items.push({ emoji: "💧", label: "Water" });
  if (activity === "beach") { items.push({ emoji: "🏖️", label: "Towel" }); items.push({ emoji: "👙", label: "Swimwear" }); }
  if (activity === "photography") items.push({ emoji: "📷", label: "Camera" });
  if (activity === "cycling" && !daytime) items.push({ emoji: "🔦", label: "Lights" });
  const seen = new Set();
  return items.filter(i => {
    if (seen.has(i.label)) return false;
    seen.add(i.label);
    return true;
  });
}

export function calcHeatIndex(tempC, humidity) {
  if (tempC < 27) return null;
  const t = tempC;
  const r = humidity;
  const hi = -8.784695 + 1.61139411 * t + 2.338549 * r - 0.14611605 * t * r - 0.012308094 * t * t - 0.016424828 * r * r + 0.002211732 * t * t * r + 0.00072546 * t * r * r - 0.000003582 * t * t * r * r;
  return Math.round(hi);
}

export function calcWindChill(tempC, windKmh) {
  if (tempC > 10 || windKmh < 4.8) return null;
  const wc = 13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16);
  return Math.round(wc);
}

export function calcHumidex(tempC, dewPointC) {
  if (dewPointC == null) return null;
  const e = 6.11 * Math.exp(5417.7530 * (1 / 273.16 - 1 / (273.16 + dewPointC)));
  const h = 0.5555 * (e - 10.0);
  return Math.round(tempC + h);
}

export function calcSunburnTime(uvIndex) {
  if (!uvIndex || uvIndex <= 0) return null;
  const minutes = Math.round(200 / uvIndex);
  return minutes;
}

export function getVisibilityContext(visibilityMeters) {
  if (visibilityMeters == null || isNaN(visibilityMeters)) return null;
  const km = visibilityMeters / 1000;
  const footballFields = Math.round(km / 0.1);
  let quality;
  if (km > 10) quality = "Excellent — you can see for miles";
  else if (km > 5) quality = "Good visibility";
  else if (km > 2) quality = "Moderate — distant objects hazy";
  else if (km > 1) quality = "Poor — reduce speed if driving";
  else quality = "Very poor — fog conditions";
  return { km: km.toFixed(1), fields: footballFields, quality };
}

export function getWindPowerContext(windKmh) {
  if (windKmh < 5) return { text: "Barely a whisper", action: "Candles stay lit", emoji: "🕯️" };
  if (windKmh < 15) return { text: "Gentle breeze", action: "Perfect for a kite", emoji: "🪁" };
  if (windKmh < 25) return { text: "Moderate wind", action: "Umbrella flips inside out", emoji: "☂️" };
  if (windKmh < 40) return { text: "Strong wind", action: "Trees are swaying hard", emoji: "🌳" };
  if (windKmh < 60) return { text: "Gale force", action: "Walking is difficult", emoji: "💨" };
  return { text: "Storm force", action: "Stay indoors if possible", emoji: "🌪️" };
}

export function getDewPointComfort(dewPointC) {
  if (dewPointC == null) return null;
  if (dewPointC < 10) return { level: "Dry", text: "Very comfortable", emoji: "✨" };
  if (dewPointC < 16) return { level: "Comfortable", text: "Pleasant", emoji: "😊" };
  if (dewPointC < 18) return { level: "OK", text: "Noticeable humidity", emoji: "😐" };
  if (dewPointC < 21) return { level: "Humid", text: "Getting sticky", emoji: "😓" };
  if (dewPointC < 24) return { level: "Oppressive", text: "Very uncomfortable", emoji: "🥵" };
  return { level: "Extreme", text: "Tropical — stay inside", emoji: "🫠" };
}

export function getPressureTrend(pressure) {
  if (pressure == null) return null;
  if (pressure > 1025) return { dir: "High", text: "Stable, clear weather likely", emoji: "☀️" };
  if (pressure > 1013) return { dir: "Above avg", text: "Fair weather continuing", emoji: "🌤️" };
  if (pressure > 1000) return { dir: "Below avg", text: "Clouds or rain possible", emoji: "☁️" };
  return { dir: "Low", text: "Stormy weather possible", emoji: "⛈️" };
}

export const ACTIVITIES = [
  { name: "Running", key: "running", emoji: "🏃" },
  { name: "Hiking", key: "hiking", emoji: "🥾" },
  { name: "Cycling", key: "cycling", emoji: "🚴" },
  { name: "Beach", key: "beach", emoji: "🏖️" },
  { name: "Photography", key: "photography", emoji: "📷" },
  { name: "Stargazing", key: "stargazing", emoji: "🔭" },
];

export const WEAR_RULES = {
  jacket: (temp, wind) => temp < 10 || wind >= 30,
  umbrella: (code, precip) => (code >= 51 && code <= 82) || precip >= 50,
  sunglasses: (code, uv) => code <= 2 && uv >= 5,
  sunscreen: (code, uv) => code <= 2 && uv >= 3,
  boots: (code) => code >= 71 && code <= 86,
  shorts: (temp) => temp >= 25,
  scarf: (temp) => temp < 5,
  raincoat: (code) => code >= 61 && code <= 65,
};

export const WEAR_ITEMS = [
  { key: "jacket", label: "🧥 Jacket" },
  { key: "umbrella", label: "☂️ Umbrella" },
  { key: "sunglasses", label: "🕶️ Sunglasses" },
  { key: "sunscreen", label: "🧴 Sunscreen" },
  { key: "boots", label: "👢 Boots" },
  { key: "shorts", label: "🩳 Shorts" },
  { key: "scarf", label: "🧣 Scarf" },
  { key: "raincoat", label: "🧥 Raincoat" },
];
