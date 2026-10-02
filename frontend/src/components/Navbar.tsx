import React from 'react';
import { CloudRain, MapPin, Calendar, RefreshCw, Database, Menu, X } from 'lucide-react';
import type { LocationItem } from '../types';

interface NavbarProps {
  location: LocationItem;
  startDate: string;
  endDate: string;
  totalRecords: number;
  isLoading: boolean;
  onOpenLocationSearch: () => void;
  onOpenDateRange: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  location,
  startDate,
  endDate,
  totalRecords,
  isLoading,
  onOpenLocationSearch,
  onOpenDateRange,
  onRefresh,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Toggle Navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20">
                <CloudRain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                    Statistical Rainfall Analysis and Prediction System
                  </span>
                  <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                    RainStat v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                  Academic Platform for Probability Theory & Statistical Inference
                </p>
              </div>
            </div>
          </div>

          {/* Right: Controls & Badges */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Location Selector */}
            <button
              onClick={onOpenLocationSearch}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
              title="Click to search location"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-white truncate max-w-[120px] sm:max-w-[160px]">
                {location.name}
              </span>
              <span className="text-[10px] text-slate-400 hidden md:inline">
                ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
              </span>
            </button>

            {/* Date Range Selector */}
            <button
              onClick={onOpenDateRange}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
              title="Click to change date range"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>{startDate} to {endDate}</span>
            </button>

            {/* Records badge */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono rounded bg-slate-900 border border-slate-800 text-slate-300">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>N = {totalRecords.toLocaleString()} days</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Refresh Real API Data"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
