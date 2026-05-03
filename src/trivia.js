export const TRIVIA_QUESTIONS = [
  { q: "What is the highest recorded temperature on Earth?", opts: ["56.7°C", "58.2°C", "54.1°C", "60.0°C"], correct: 0 },
  { q: "Which country experiences the most tornadoes?", opts: ["Canada", "Bangladesh", "United States", "Brazil"], correct: 2 },
  { q: "What scale measures hurricane wind speed?", opts: ["Richter", "Beaufort", "Saffir-Simpson", "Fujita"], correct: 2 },
  { q: "What is a haboob?", opts: ["A snowstorm", "A dust storm", "A hurricane", "A flood"], correct: 1 },
  { q: "The coldest temperature ever recorded was in:", opts: ["Greenland", "Siberia", "Antarctica", "Alaska"], correct: 2 },
  { q: "What cloud type produces thunderstorms?", opts: ["Stratus", "Cumulus", "Cumulonimbus", "Cirrus"], correct: 2 },
  { q: "How many lightning strikes occur per day worldwide?", opts: ["1 million", "4 million", "8 million", "12 million"], correct: 2 },
  { q: "What is the speed of sound in air at 20°C?", opts: ["243 m/s", "343 m/s", "443 m/s", "543 m/s"], correct: 1 },
  { q: "What phenomenon causes a 'sun dog'?", opts: ["Water droplets", "Ice crystals", "Dust particles", "Pollen"], correct: 1 },
  { q: "Which US state is the windiest?", opts: ["Texas", "Alaska", "Wyoming", "Montana"], correct: 2 },
  { q: "What is the Beaufort scale measuring?", opts: ["Temperature", "Wind force", "Rainfall", "Humidity"], correct: 1 },
  { q: "What does 'nimbus' mean in cloud names?", opts: ["High", "Dark", "Rain-bearing", "Thin"], correct: 2 },
  { q: "The eye of a hurricane is typically how wide?", opts: ["1-5 km", "10-30 km", "50-100 km", "200+ km"], correct: 1 },
  { q: "What is a 'microburst'?", opts: ["Tiny tornado", "Localized downdraft", "Small hail", "Brief rain"], correct: 1 },
  { q: "Which planet has the fastest winds in the solar system?", opts: ["Jupiter", "Saturn", "Neptune", "Mars"], correct: 2 },
  { q: "What is the dew point?", opts: ["Dew forms here", "Condensation temperature", "Rain threshold", "Freezing point"], correct: 1 },
  { q: "Lake-effect snow is caused by:", opts: ["Mountain lift", "Cold air over warm water", "Ocean currents", "Jet streams"], correct: 1 },
  { q: "What is a 'derecho'?", opts: ["A long-lived windstorm", "A type of hail", "A snow squall", "A fog bank"], correct: 0 },
  { q: "How hot is lightning?", opts: ["5,000°C", "15,000°C", "30,000°C", "50,000°C"], correct: 2 },
  { q: "What is virga?", opts: ["Rain that evaporates before reaching ground", "A type of cloud", "Hail formation", "Ice crystals"], correct: 0 },
  { q: "The jet stream flows from:", opts: ["East to West", "West to East", "North to South", "South to North"], correct: 1 },
  { q: "What is a 'polar vortex'?", opts: ["Arctic blizzard", "Upper-level circulation", "Ice storm", "Sea ice"], correct: 1 },
  { q: "Which gas is most responsible for the greenhouse effect?", opts: ["CO₂", "Methane", "Water vapor", "Ozone"], correct: 2 },
  { q: "What is the Fujita scale used for?", opts: ["Hurricanes", "Earthquakes", "Tornadoes", "Floods"], correct: 2 },
  { q: "What is a 'bomb cyclone'?", opts: ["Explosive volcanic eruption", "Rapid pressure drop", "Severe hail", "Tornado outbreak"], correct: 1 },
  { q: "The 'Roaring Forties' refer to:", opts: ["1940s weather records", "Strong westerly winds", "Tornado season", "Heat waves"], correct: 1 },
  { q: "What is 'black ice'?", opts: ["Volcanic ice", "Thin transparent ice", "Frozen soot", "Deep ocean ice"], correct: 1 },
  { q: "A rainbow forms when light is:", opts: ["Absorbed", "Reflected only", "Refracted and dispersed", "Scattered"], correct: 2 },
  { q: "What is the wettest place on Earth?", opts: ["Amazon", "Cherrapunji", "Congo", "Borneo"], correct: 1 },
  { q: "What is an El Niño event?", opts: ["Cold Pacific phase", "Warm Pacific phase", "Atlantic current", "Arctic oscillation"], correct: 1 },
];

export function getStreak() {
  try {
    const d = JSON.parse(localStorage.getItem("trivia-streak") || "{}");
    if (!d.last) return 0;
    const diff = Math.floor((Date.now() - d.last) / 86400000);
    return diff <= 1 ? d.count || 0 : 0;
  } catch { return 0; }
}

export function saveStreak(count) {
  localStorage.setItem("trivia-streak", JSON.stringify({ last: Date.now(), count }));
}

export function getBestScore() {
  try { return parseInt(localStorage.getItem("trivia-best") || "0", 10); } catch { return 0; }
}

export function saveBestScore(score) {
  localStorage.setItem("trivia-best", String(Math.max(score, getBestScore())));
}
