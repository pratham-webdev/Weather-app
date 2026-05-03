import { memo } from "react";
import { getWeatherInfo } from "../../utils.js";

const WeatherIcon = memo(function WeatherIcon({ code, size = "medium" }) {
  const info = getWeatherInfo(code);
  const sizeMap = { small: "1.25rem", medium: "1.5rem", large: "2rem", hero: "3rem" };
  return <span style={{ fontSize: sizeMap[size] }}>{info.emoji}</span>;
});

export default WeatherIcon;
