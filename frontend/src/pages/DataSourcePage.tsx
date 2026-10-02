import React from 'react';
import { ShieldCheck, Info, ExternalLink, Database, MapPin, Calendar, Clock, Layers } from 'lucide-react';
import type { HistoricalWeatherResponse, LocationItem } from '../types';

interface DataSourcePageProps {
  weatherData: HistoricalWeatherResponse | null;
  location: LocationItem;
}

export const DataSourcePage: React.FC<DataSourcePageProps> = ({ weatherData, location }) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Scientific Transparency & Provenance</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Data Source Documentation & Reanalysis Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Full academic disclosure of meteorological data origin, reanalysis model mechanics,
          latency coverage, and API integration specifications.
        </p>
      </div>

      {/* Main Transparency Card */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-900/60 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
          <Info className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            Historical Data Origin: Atmospheric Reanalysis (ERA5 / ERA5-Land)
          </h3>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed font-sans">
          <p>
            <strong className="text-white">Academic Transparency Notice: </strong>
            All historical weather records utilized in this project are retrieved dynamically from the{' '}
            <strong className="text-cyan-400">Open-Meteo Historical Weather API</strong>.
          </p>
          <p>
            This historical archive is derived from <strong className="text-white">atmospheric reanalysis models</strong> (primarily ECMWF ERA5 and ERA5-Land at 9–11 km grid resolution). Atmospheric reanalysis combines past meteorological observations from satellites, weather balloons, radar, and ocean buoys with sophisticated physics-based numerical weather prediction models to reconstruct continuous global weather fields.
          </p>
          <p className="text-amber-300">
            ⚠️ <strong>Crucial Academic Caveat:</strong> The returned values represent high-resolution physical grid-cell estimates rather than direct physical rain-gauge tipping buckets at that exact street address. We never falsely claim that every historical value is an unmodeled local rain-gauge measurement.
          </p>
        </div>
      </div>

      {/* Active Dataset Provenance Table */}
      {weatherData && (
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Active Session Dataset Provenance</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Location Station</span>
              <div className="text-white font-bold mt-1 font-sans">{location.name}, {location.country}</div>
              <div className="text-cyan-400 text-[10px]">{location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Temporal Coverage Span</span>
              <div className="text-white font-bold mt-1">{weatherData.quality_report.min_date} to {weatherData.quality_report.max_date}</div>
              <div className="text-slate-400 text-[10px]">{weatherData.total_records} daily records</div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Retrieval Timestamp</span>
              <div className="text-sky-300 font-bold mt-1 text-[11px] truncate">
                {weatherData.metadata.retrieval_timestamp || new Date().toISOString()}
              </div>
              <div className="text-slate-500 text-[10px]">In-memory cache active</div>
            </div>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Target Variable</span>
              <div className="text-emerald-400 font-bold mt-1 font-sans">rain_sum (mm)</div>
              <div className="text-slate-400 text-[10px] font-sans">Unit: millimeters</div>
            </div>
          </div>
        </div>
      )}

      {/* Target Variable Distinctions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Target: rain_sum vs. precipitation_sum</span>
          </h4>
          <p className="text-slate-300 leading-relaxed">
            <code className="text-cyan-400">rain_sum</code> measures liquid rain depth specifically in millimeters (mm).
          </p>
          <p className="text-slate-400 leading-relaxed">
            <code className="text-slate-300">precipitation_sum</code> encompasses total water equivalent from all hydrometeor types (including snow, sleet, and freezing rain where applicable). Both variables are maintained for comparative validation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3 text-xs">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Reanalysis Latency vs. Forecast Horizon</span>
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Atmospheric reanalysis archives (ERA5) typically operate with a 2-to-5 day data release latency required for assimilation of global satellite passes.
          </p>
          <p className="text-slate-400 leading-relaxed">
            For current day and future days, the system queries the <strong className="text-white">Open-Meteo Forecast API</strong> to acquire input atmospheric variables for our statistical prediction model.
          </p>
        </div>
      </div>

      {/* External Resources */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">
          Official Documentation & Open Data Portals:
        </span>
        <div className="flex items-center space-x-4">
          <a
            href="https://open-meteo.com/en/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>Open-Meteo API Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.ecmwf.int/en/forecasts/datasets/reanalysis-datasets/era5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>ECMWF ERA5 Reanalysis</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.maptiler.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>MapTiler Cloud</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
