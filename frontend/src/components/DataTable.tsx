import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
import type { WeatherRecord } from '../types';

interface DataTableProps {
  records: WeatherRecord[];
  locationName: string;
}

export const DataTable: React.FC<DataTableProps> = ({ records, locationName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rainFilter, setRainFilter] = useState<'all' | 'rainy' | 'dry'>('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Filter and Sort
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      const matchSearch = !searchTerm || r.date.includes(searchTerm);

      // Rain filter (threshold 1.0 mm)
      const rain = r.rain_sum ?? 0;
      let matchRain = true;
      if (rainFilter === 'rainy') matchRain = rain >= 1.0;
      if (rainFilter === 'dry') matchRain = rain < 1.0;

      return matchSearch && matchRain;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [records, searchTerm, rainFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for new field
    }
  };

  const exportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['date', 'rain_sum', 'precipitation_sum', 'temperature_2m_mean', 'relative_humidity_2m_mean', 'pressure_msl_mean', 'wind_speed_10m_max'];
    const rows = filteredRecords.map((r) => [
      r.date,
      r.rain_sum ?? 0,
      r.precipitation_sum ?? r.rain_sum ?? 0,
      r.temperature_2m_mean ?? '',
      r.relative_humidity_2m_mean ?? '',
      r.pressure_msl_mean ?? '',
      r.wind_speed_10m_max ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${locationName.toLowerCase()}_rainfall_observations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col space-y-4 p-6">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by date (YYYY-MM)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          {/* Filter dropdown */}
          <div className="flex items-center space-x-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={rainFilter}
              onChange={(e) => {
                setRainFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Days</option>
              <option value="rainy" className="bg-slate-900">Rainy Days (≥ 1.0 mm)</option>
              <option value="dry" className="bg-slate-900">Dry Days (&lt; 1.0 mm)</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing {filteredRecords.length.toLocaleString()} matching records
          </div>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 hover:text-white transition flex items-center space-x-2 shadow-sm"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th onClick={() => handleSort('date')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('rain_sum')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Rain Sum (mm)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('precipitation_sum')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Precip Sum (mm)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('temperature_2m_mean')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Temp Mean (°C)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('relative_humidity_2m_mean')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Rel Humidity (%)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('pressure_msl_mean')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Pressure (hPa)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th onClick={() => handleSort('wind_speed_10m_max')} className="px-4 py-3 cursor-pointer hover:text-cyan-400 transition">
                <div className="flex items-center space-x-1">
                  <span>Wind Max (km/h)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-sans">
                  No records match your current filter criteria.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 text-white font-medium">{r.date}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded ${
                      (r.rain_sum ?? 0) >= 15.0
                        ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80'
                        : (r.rain_sum ?? 0) >= 1.0
                        ? 'bg-blue-950/70 text-blue-300'
                        : 'text-slate-400'
                    }`}>
                      {r.rain_sum?.toFixed(1) ?? '0.0'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400">{r.precipitation_sum?.toFixed(1) ?? r.rain_sum?.toFixed(1) ?? '0.0'}</td>
                  <td className="px-4 py-2.5 text-slate-300">{r.temperature_2m_mean?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-300">{r.relative_humidity_2m_mean?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.pressure_msl_mean?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-400">{r.wind_speed_10m_max?.toFixed(1) ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <div>
          Page <span className="font-semibold text-white">{currentPage}</span> of{' '}
          <span className="font-semibold text-white">{totalPages}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
