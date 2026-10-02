import React, { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onApplyDateRange: (start: string, end: string) => void;
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onApplyDateRange,
}) => {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  // Safe default max historical date: recent historical coverage is typically yesterday or a few days ago
  const defaultRecentDate = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const presets = [
    { label: 'Last 3 Years', start: `${currentYear - 3}-01-01`, end: defaultRecentDate },
    { label: 'Last 5 Years', start: `${currentYear - 5}-01-01`, end: defaultRecentDate },
    { label: 'Last 10 Years', start: `${currentYear - 10}-01-01`, end: defaultRecentDate },
    { label: '2016 to Present', start: '2016-01-01', end: defaultRecentDate },
    { label: '2020 to 2024 (Pandemic Era)', start: '2020-01-01', end: '2024-12-31' },
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(end) < new Date(start)) {
      alert("End date cannot be prior to start date.");
      return;
    }
    onApplyDateRange(start, end);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">Select Historical Period</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-6 space-y-5">
          {/* Quick presets */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-2">Historical Presets:</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setStart(p.start);
                    setEnd(p.end);
                  }}
                  className="px-3 py-2 text-left text-xs rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition"
                >
                  <div className="font-semibold text-white">{p.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.start} to {p.end}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Start Date</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">End Date</label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Data Coverage Note:</span> Historical data is queried from Open-Meteo's ERA5 reanalysis archive. The system automatically reads actual returned coverage dates without faking missing recent days.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-sky-600/20 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Range</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
