import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, Info, ExternalLink } from 'lucide-react';
import type { LocationItem } from '../types';

interface LocationMapProps {
  location: LocationItem;
}

export const LocationMap: React.FC<LocationMapProps> = ({ location }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerInstance = useRef<maplibregl.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const maptilerApiKey = import.meta.env.VITE_MAPTILER_API_KEY || '';

  useEffect(() => {
    if (!mapContainer.current) return;

    // Map style: if maptiler key is present, use MapTiler styled vector tiles; otherwise use OpenStreetMap raster tiles
    const styleUrl = maptilerApiKey && maptilerApiKey !== 'YOUR_MAPTILER_API_KEY'
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerApiKey}`
      : {
          version: 8 as const,
          sources: {
            'osm-tiles': {
              type: 'raster' as const,
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors | MapTiler',
            },
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster' as const,
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        };

    try {
      if (!mapInstance.current) {
        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: styleUrl,
          center: [location.longitude, location.latitude],
          zoom: 7,
          attributionControl: false,
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        // Custom Marker
        const el = document.createElement('div');
        el.className = 'custom-map-marker';
        el.innerHTML = `
          <div style="background: #06b6d4; border: 2px solid #ffffff; width: 24px; height: 24px; border-radius: 50%; box-shadow: 0 0 15px rgba(6, 182, 212, 0.7); display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="background: #ffffff; width: 8px; height: 8px; border-radius: 50%;"></div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="color: #0f172a; padding: 4px 6px; font-family: system-ui, sans-serif;">
            <strong style="font-size: 13px;">${location.name}</strong><br/>
            <span style="font-size: 11px; color: #475569;">${[location.admin1, location.country].filter(Boolean).join(', ')}</span><br/>
            <span style="font-size: 10px; font-family: monospace; color: #0891b2;">${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E</span>
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([location.longitude, location.latitude])
          .setPopup(popup)
          .addTo(map);

        mapInstance.current = map;
        markerInstance.current = marker;
      } else {
        // Fly to updated coordinates
        mapInstance.current.flyTo({
          center: [location.longitude, location.latitude],
          zoom: 7,
          speed: 1.2,
        });

        if (markerInstance.current) {
          markerInstance.current.setLngLat([location.longitude, location.latitude]);
          markerInstance.current.getPopup()?.setHTML(`
            <div style="color: #0f172a; padding: 4px 6px; font-family: system-ui, sans-serif;">
              <strong style="font-size: 13px;">${location.name}</strong><br/>
              <span style="font-size: 11px; color: #475569;">${[location.admin1, location.country].filter(Boolean).join(', ')}</span><br/>
              <span style="font-size: 10px; font-family: monospace; color: #0891b2;">${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E</span>
            </div>
          `);
        }
      }
    } catch (err: any) {
      console.warn("MapLibre init notice:", err);
      setMapError("Failed to initialize map styling.");
    }

    return () => {
      // Keep instance alive during state re-renders to prevent flickering
    };
  }, [location, maptilerApiKey]);

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
      {/* Map Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Geographic Station Location
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{location.name}: {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</span>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-950">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Map Key Notice */}
        {(!maptilerApiKey || maptilerApiKey === 'YOUR_MAPTILER_API_KEY') && (
          <div className="absolute bottom-2 left-2 z-10 px-2 py-1 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded text-[10px] text-slate-300 flex items-center space-x-1.5 shadow">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>Map active via MapLibre. (MapTiler key optional in .env)</span>
          </div>
        )}
      </div>

      {/* Map Footer Bar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-slate-300 font-medium">Timezone:</span>
          <span className="font-mono text-cyan-400">{location.timezone}</span>
        </div>
        <div className="text-[10px] text-slate-400">
          Selected coordinates dynamically passed to Open-Meteo Historical & Forecast engines
        </div>
      </div>
    </div>
  );
};
