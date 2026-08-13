import { useState, useRef, useEffect } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { searchPlace } from "../../lib/geocode";
import GlassPanel from "../ui/GlassPanel";

export default function SearchBar({ onSelectPlace, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const places = await searchPlace(query);
        setResults(places);
      } catch {
        setError("Не удалось выполнить поиск");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="absolute inset-x-0 top-0 z-30 px-4 pt-4">
      <div className="flex items-center gap-2">
        <GlassPanel className="flex-1 rounded-xl h-11 flex items-center px-3.5 gap-2">
          <Search className="w-4 h-4 text-gray-300 shrink-0" strokeWidth={2.4} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти город или место…"
            className="flex-1 bg-transparent outline-none text-white text-[14px] placeholder:text-gray-400"
          />
          {loading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" strokeWidth={2.4} />
          )}
        </GlassPanel>
        <button
          onClick={onClose}
          className="w-11 h-11 rounded-full glass-panel flex items-center justify-center shrink-0 text-gray-300 hover:text-white transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" strokeWidth={2.4} />
        </button>
      </div>

      {(results.length > 0 || error) && (
        <GlassPanel className="rounded-xl mt-2 max-h-[45dvh] overflow-y-auto">
          {error && <p className="text-red-300 text-[12px] px-4 py-3">{error}</p>}
          {results.map((place) => (
            <button
              key={place.id}
              onClick={() => onSelectPlace(place)}
              className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" strokeWidth={2.2} />
              <span className="text-gray-200 text-[13px] leading-snug">{place.name}</span>
            </button>
          ))}
        </GlassPanel>
      )}
    </div>
  );
}
