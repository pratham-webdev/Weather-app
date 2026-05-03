import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

const STORAGE_KEY = "weather-recent";
const MAX_RECENT = 8;

const CitySearch = ({ onSelect, voiceQuery }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const [focused, setFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (voiceQuery) {
      setQuery(voiceQuery);
      inputRef.current?.focus();
    }
  }, [voiceQuery]);

  const hasResults = results.length > 0;
  const showRecent = !query && focused && recent.length > 0;

  useEffect(() => {
    if (!query.trim()) { setResults([]); setActiveIdx(-1); setLoading(false); return; }
    if (query.trim().length < 2) { setResults([]); setActiveIdx(-1); return; }
    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=6&lang=en`);
        const data = await res.json();
        const mapped = (data.features || []).map((f, i) => {
          const p = f.properties;
          const [lon, lat] = f.geometry.coordinates;
          const name = p.name || p.housename || "";
          const street = p.street || "";
          const district = p.district || p.suburb || "";
          const city = p.city || p.town || p.village || p.municipality || "";
          const state = p.state || "";
          const country = p.country || "";
          const locationParts = [district, city, state, country].filter(Boolean);
          return {
            id: `${p.osm_type}_${p.osm_id}_${i}`,
            name: name || city || "Unknown",
            detail: locationParts.join(", "),
            latitude: lat,
            longitude: lon,
            osmId: p.osm_id,
          };
        }).filter(r => r.name && r.latitude);
        setResults(mapped);
        setActiveIdx(-1);
      } catch (e) { console.error("Search error:", e); setResults([]); }
      finally { setLoading(false); }
    }, 250);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const selectResult = useCallback((r) => {
    const recentEntry = { name: `${r.name}${r.detail ? ", " + r.detail : ""}`, latitude: r.latitude, longitude: r.longitude };
    setRecent(prev => {
      const updated = [recentEntry, ...prev.filter(x => x.name !== recentEntry.name)].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    onSelect(r);
    setQuery("");
    setResults([]);
    setActiveIdx(-1);
    setFocused(false);
  }, [onSelect]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setResults([]);
        setQuery("");
        setActiveIdx(-1);
        inputRef.current?.blur();
      }
      if (e.key === "ArrowDown" && hasResults && document.activeElement === inputRef.current) {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp" && hasResults && document.activeElement === inputRef.current) {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && activeIdx >= 0 && results[activeIdx]) {
        e.preventDefault();
        selectResult(results[activeIdx]);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [hasResults, activeIdx, results, selectResult]);

  const dropdownEl = useMemo(() => {
    if (!hasResults && !showRecent) return null;
    const rect = inputRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return createPortal(
      <div className="search-dropdown-portal" style={{ top: rect.bottom + 8, left: rect.left, width: rect.width, minWidth: 280 }} role="listbox">
        {hasResults && results.map((r, i) => (
          <div key={r.id} className={`search-dropdown-item${i === activeIdx ? " highlighted" : ""}`} role="option" onMouseDown={() => selectResult(r)} onMouseEnter={() => setActiveIdx(i)}>
            <div className="search-dropdown-name">{r.name}</div>
            <div className="search-dropdown-detail">{r.detail}</div>
          </div>
        ))}
        {!hasResults && showRecent && (
          <>
            <div className="search-dropdown-section-label">Recent</div>
            {recent.map((r, i) => (
              <div key={i} className="search-dropdown-item" role="option" onMouseDown={() => selectResult({ name: r.name, latitude: r.latitude, longitude: r.longitude })}>
                <div className="search-dropdown-name">{r.name}</div>
              </div>
            ))}
          </>
        )}
      </div>,
      document.body
    );
  }, [results, showRecent, activeIdx, recent, hasResults, selectResult]);

  return (
    <div className="search-container">
      <span className="search-icon">🔍</span>
      <input ref={inputRef} className="search-input" type="text" placeholder="Search city... (/)" value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 200)} aria-label="Search for a city" role="combobox" aria-expanded={hasResults || showRecent} />
      {loading && <div className="search-loading" />}
      {dropdownEl}
    </div>
  );
};

export default CitySearch;
