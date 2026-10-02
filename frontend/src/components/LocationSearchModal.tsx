import React, { useState } from 'react';
import { Search, MapPin, X, Loader2, Compass } from 'lucide-react';
import type { LocationItem } from '../types';
import { searchLocations } from '../services/api';

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationItem) => void;
  currentLocation: LocationItem;
}

const PRESET_LOCATIONS: LocationItem[] = [
  { id: 1269843, name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata', country_code: 'IN' },
  { id: 1253628, name: 'Warangal', country: 'India', admin1: 'Telangana', latitude: 17.9689, longitude: 79.5941, timezone: 'Asia/Kolkata', country_code: 'IN' },
  { id: 1277333, name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', country_code: 'IN' },
  { id: 1275339, name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata', country_code: 'IN' },
  { id: 1273294, name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata', country_code: 'IN' },
  { id: 1264527, name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata', country_code: 'IN' },
  { id: 1275004, name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', country_code: 'IN' },
];

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const items = await searchLocations(query.trim());
      setResults(items);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Geographic Location Search</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter city or region name (e.g. Hyderabad, Warangal, Tokyo)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || query.length < 2}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center space-x-1.5 shadow-lg shadow-cyan-600/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {/* Quick presets */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Quick Academic Selections:</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border ${
                    currentLocation.name === loc.name
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {loc.name}, {loc.country}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {loading && (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
              <span>Querying Open-Meteo Geocoding API...</span>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-sm">
              No matching locations found for "{query}". Try another spelling.
            </div>
          )}

          {!loading && results.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectLocation(loc);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 text-cyan-400 group-hover:text-cyan-300 transition">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition">
                    {loc.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-400">
                <div>{loc.latitude.toFixed(4)}°N, {loc.longitude.toFixed(4)}°E</div>
                <div className="text-slate-400">{loc.timezone}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
