import React from "react";

export default function LoadingState() {
  return (
    <div>
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton skeleton-card" />)}
      </div>
      <div style={{ display: "flex", gap: "12px", overflow: "hidden", marginBottom: "24px" }}>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton skeleton-hourly" />)}
      </div>
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton skeleton-daily" />)}
    </div>
  );
}
