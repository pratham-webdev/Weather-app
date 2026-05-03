import { useRef, useEffect, memo } from "react";

const WeatherParticles = memo(function WeatherParticles({ type }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const maxParticles = isMobile ? 60 : 150;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(maxParticles, type === "snowy" ? 100 : 80);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: type === "snowy" ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
        speed: type === "rainy" ? 5 + Math.random() * 8 : type === "snowy" ? 1 + Math.random() * 2 : 0.3 + Math.random() * 0.5,
        wind: type === "rainy" ? -1 + Math.random() * 2 : Math.random() * 0.5,
        opacity: 0.2 + Math.random() * 0.4,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      if (type === "clear" || type === "cloudy") {
        // Subtle floating particles
        particles.forEach(p => {
          p.x += p.wind;
          p.y -= p.speed * 0.3;
          if (p.y < -10) p.y = h + 10;
          if (p.x < -10) p.x = w + 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.3})`;
          ctx.fill();
        });
      } else if (type === "rainy" || type === "stormy") {
        particles.forEach(p => {
          p.y += p.speed;
          p.x += p.wind;
          if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
          if (p.x < -10 || p.x > w + 10) p.x = Math.random() * w;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.wind * 2, p.y + p.speed * 2);
          ctx.strokeStyle = `rgba(174,194,224,${p.opacity})`;
          ctx.lineWidth = p.r * 0.5;
          ctx.stroke();
        });
      } else if (type === "snowy") {
        particles.forEach(p => {
          p.y += p.speed;
          p.x += Math.sin(p.y * 0.01) + p.wind * 0.3;
          if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
          if (p.x < -10 || p.x > w + 10) p.x = Math.random() * w;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          ctx.fill();
        });
      } else if (type === "foggy") {
        particles.forEach(p => {
          p.x += p.wind * 0.5;
          if (p.x > w + 50) p.x = -50;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,200,210,${p.opacity * 0.1})`;
          ctx.fill();
        });
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [type, maxParticles]);

  return <canvas ref={canvasRef} className="weather-particles" />;
});

export default WeatherParticles;
