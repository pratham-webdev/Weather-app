# Weather Dashboard

A modern, feature-rich weather PWA built with React 18 CDN + Open-Meteo API.

## Features

- **Real-time weather** — Current conditions, 24-hour forecast, 7-day forecast
- **Visualizations** — Sun Arc, Temperature/Precipitation chart (with Feels Like overlay), Wind compass, UV scale
- **Air Quality** — AQI with pollutant breakdown (PM2.5, PM10, O₃, NO₂)
- **Moon Phase** — Current moon phase with rise/set times
- **Historical comparison** — "1 year ago today" weather comparison
- **Severe weather alerts** — Official alerts from Open-Meteo + heuristic-based warnings
- **Multi-city comparison** — Compare up to 3 cities side-by-side
- **Dynamic themes** — Day/night-aware gradients + light/dark toggle
- **Favorites** — Pin cities for quick access
- **Share** — Copy text or download a styled weather card image
- **PWA** — Service worker caching, installable, works offline
- **Print-friendly** — Clean `@media print` stylesheet
- **Accessibility** — Skip link, aria-live regions, roles, keyboard navigation
- **Local telemetry** — Feature usage tracked in localStorage (no external services)

## Running

```bash
cd Weather-app
py -m http.server 8000
```

Then open `http://localhost:8000`.

> **Note:** Must be served via HTTP (not file://) for CORS, Service Worker, and Geolocation to work.

## Tech

- React 18 (CDN) + Babel Standalone (in-browser JSX)
- Open-Meteo API (weather, geocoding, AQI, moon, archive)
- No build step required

## Production Note

> Babel Standalone (`babel.min.js`) is ~100KB and compiles JSX in the browser. For production, precompile JSX with a build tool (Vite, esbuild, etc.) and remove Babel to significantly reduce load time and bundle size.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Close search / modals |
| `←` / `→` | Scroll hourly forecast |
| `↑` / `↓` | Navigate search results |
| `Enter` | Select search result |
| `L` | Use my location |
| `T` | Toggle theme |
