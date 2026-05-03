# Weather Dashboard

A modern, installable weather PWA built with React 18, Vite 5, and the Open-Meteo API.

## Features

### Core Weather
- **Real-time conditions** — Temperature, feels like, humidity, pressure, wind, visibility, dew point
- **24-hour forecast** — Hourly breakdown with precipitation probability and snowfall
- **7-day forecast** — Daily highs/lows, weather codes, UV index, sunrise/sunset
- **Sun Arc** — Visual sun position tracker with golden hour indicators
- **Wind Compass** — Directional wind visualization with speed and gusts
- **UV Scale** — Color-coded UV index with exposure guidance
- **Air Quality** — US AQI with PM2.5, PM10, O₃, and NO₂ breakdown
- **Moon Phase** — Current moon phase visualization

### Smart Widgets
- **Activity Planner** — Scores 12+ activities (0–100) based on weather, with a "Today's Outlook" banner and deduplicated global risks bar
- **Walk Forecast** — Hourly precipitation bars with walk-friendliness indicator, aligned with planner scoring
- **Wear Recommender** — Clothing suggestions based on temperature, wind, and precipitation
- **Commute Planner** — Best/worst commute time windows based on weather conditions
- **Allergy Risk** — Pollen and allergy risk assessment from weather patterns
- **Plant Care** — Gardening recommendations based on rain, UV, and temperature
- **Golden Hour** — Sunrise/sunset with golden hour window for photography
- **Fun Stats** — Weather trivia, mood analysis, and personalized insights
- **Time Machine** — Historical weather comparison ("1 year ago today") via Open-Meteo Archive API

### Interactive Features
- **City Search** — Portalized dropdown (escapes clipping contexts) powered by Photon API, keyboard navigation, recent searches
- **Voice Search** — Speech-to-text city lookup via Web Speech API
- **Weather Soundscape** — Ambient audio (lofi radio or weather-reactive sounds) with volume control and station skip
- **Weather Radar** — Nearby radar stations and conditions
- **Trivia Game** — Weather-themed quiz questions
- **Multi-City Comparison** — Side-by-side weather comparison for up to 3 cities via modal

### UI/UX
- **Sticky Weather Card** — Current weather sticks to top on scroll, compresses to a compact opaque bar (removes glass blur for performance), restores on scroll-up
- **Tab Navigation** — Four tabs: Today, Forecast, Insights, Explore
- **Dynamic Themes** — Day/night-aware animated gradient backgrounds + manual light/dark toggle
- **Weather Particles** — Contextual particle effects (rain, snow, etc.)
- **Animated Weather Icons** — CSS-animated icon states
- **Favorites Bar** — Pin up to 8 cities, single-click to load, double-click to compare
- **Severe Weather Alerts** — Heuristic-based warnings displayed as banners
- **Share** — Native Web Share API or clipboard fallback with formatted weather text
- **Unit Toggle** — °C/°F and km/h/mph independent toggles
- **Print-Friendly** — Clean `@media print` stylesheet
- **Progress Indicator** — Visual loading bar during data fetches

### PWA & Performance
- **Installable** — Web app manifest and service worker for Android/home screen install
- **Offline Caching** — API responses cached via service worker (network-first with cache fallback)
- **Cached Data Fallback** — Shows stale data with indicator when network is unavailable
- **Auto-Refresh** — Live data refreshes every 10 minutes
- **Dynamic Favicon** — App icon updates to current weather emoji
- **Dynamic Page Title** — Shows temperature and conditions in the tab title

### Accessibility
- Skip-to-content link
- `aria-live` regions for alerts and status updates
- Semantic `role` attributes (tablist, tab, alert)
- Full keyboard navigation (shortcuts below)
- Focus management for modals and dropdowns

### Telemetry
- Local feature usage tracking via `localStorage` (no external services, no network calls)

## Running

### Development
```bash
cd Weather-app
npm install
npm run dev
```
Open the URL shown (typically `http://localhost:5173`).

### Production Build
```bash
npm run build
npm run preview
```

### Deploy
Push to `main` — GitHub Actions automatically builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Tech Stack

- **React 18** — Component library with hooks, memo, portal
- **Vite 5** — Build tool with HMR, fast refresh, automatic CSS extraction
- **Open-Meteo API** — Weather, geocoding, air quality, archive (free, no API key)
- **Photon API** — City search autocomplete (Komoot)
- **Web Speech API** — Voice search
- **Web Audio API** — Ambient soundscape
- **Service Worker API** — Offline caching and PWA install

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Close search / modals |
| `←` / `→` | Scroll hourly forecast |
| `Enter` | Select search result |
| `L` | Use my location |
| `T` | Toggle theme |

## Project Structure

```
Weather-app/
├── .github/workflows/deploy.yml  # CI/CD for GitHub Pages
├── index.html                    # Vite entry point
├── vite.config.js                # Vite config (base path for GitHub Pages)
├── package.json
├── public/
│   ├── manifest.json             # PWA manifest (served at root)
│   └── sw.js                     # Service worker (served at root)
├── src/
│   ├── main.jsx                  # React entry + SW registration
│   ├── App.jsx                   # Root component with tab navigation
│   ├── utils.js                  # Helpers, constants, weather logic
│   ├── soundscape.js             # Audio system (lofi + weather sounds)
│   ├── trivia.js                 # Trivia question bank
│   ├── styles.css                # Global CSS + responsive design
│   └── components/
│       ├── core/                 # CurrentWeather, HourlyForecast, DailyForecast, etc.
│       ├── widgets/              # ActivityPlanner, WalkForecast, WearRecommender, etc.
│       ├── interactive/          # TriviaGame, TimeMachine, WeatherRadar, VoiceSearch
│       ├── visual/               # WeatherParticles, AnimatedIcon
│       └── shared/               # ErrorBoundary, LoadingState, HistoricalCard
└── LEARNINGS.md                  # API docs, bugs encountered, technical notes
```
