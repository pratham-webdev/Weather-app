import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

if ("serviceWorker" in navigator) {
  const swUrl = import.meta.env.PROD ? "/Weather-app/sw.js" : "/sw.js";
  navigator.serviceWorker.register(swUrl).catch(() => {});
}
