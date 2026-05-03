import { memo } from "react";

const AnimatedIcon = memo(function AnimatedIcon({ type }) {
  if (type === "clear") {
    return (
      <div className="weather-icon-container">
        <div className="sun-rays">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)` }} />
          ))}
        </div>
        <div className="weather-icon-sun" />
      </div>
    );
  }
  if (type === "cloudy") {
    return (
      <div className="weather-icon-container">
        <div className="cloud-container">
          <div className="weather-icon-cloud" />
        </div>
      </div>
    );
  }
  if (type === "rainy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-rain" />
        <div className="raindrops">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="raindrop" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === "snowy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-snow" />
        <div className="snowflakes">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="snowflake" style={{ animationDelay: `${i * 0.3}s`, width: `${4 + i}px`, height: `${4 + i}px` }} />
          ))}
        </div>
      </div>
    );
  }
  if (type === "stormy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-rain" />
        <div className="raindrops">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="raindrop" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div className="lightning" />
      </div>
    );
  }
  if (type === "foggy") {
    return (
      <div className="weather-icon-container">
        <div className="weather-icon-fog">
          <div className="fog-line" />
          <div className="fog-line" />
          <div className="fog-line" />
          <div className="fog-line" />
        </div>
      </div>
    );
  }
  return <div className="weather-icon-container"><div className="weather-icon-cloud" /></div>;
});

export default AnimatedIcon;
