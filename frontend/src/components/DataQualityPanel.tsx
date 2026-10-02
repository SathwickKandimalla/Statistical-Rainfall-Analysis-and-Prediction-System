import React from 'react';
import { CheckCircle2, AlertTriangle, Database, CalendarCheck, Droplets, Sun, Layers } from 'lucide-react';
import type { DataQualityReport } from '../types';

interface DataQualityPanelProps {
  report: DataQualityReport;
}

export const DataQualityPanel: React.FC<DataQualityPanelProps> = ({ report }) => {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Data Quality & Validation Pipeline</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated verification, chronological validation, and imputation audit trail
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {report.overall_missing_percentage === 0 ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              100% Complete & Validated
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              {report.overall_missing_percentage}% Missing Imputed
            </span>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Total Days</div>
          <div className="text-lg font-bold text-white mt-1 font-mono">{report.total_records.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Chronological rows</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Date Continuity</div>
          <div className="flex items-center space-x-1.5 mt-1">
            <span className={`text-sm font-bold ${report.date_continuity ? 'text-emerald-400' : 'text-amber-400'}`}>
              {report.date_continuity ? 'Continuous' : `${report.missing_date_intervals} Gaps`}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Daily sequence integrity</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Rainy Days</div>
          <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">{report.rainy_days.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">≥ {report.rain_threshold_mm} mm/day</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Dry Days</div>
          <div className="text-lg font-bold text-amber-300 mt-1 font-mono">{report.dry_days.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">&lt; {report.rain_threshold_mm} mm/day</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Rainy Day %</div>
          <div className="text-lg font-bold text-sky-400 mt-1 font-mono">{report.rainy_day_percentage}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Empirical P(Rain)</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Duplicate Rows</div>
          <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">{report.duplicate_dates_removed}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cleaned automatically</div>
        </div>
      </div>

      {/* Date Span & Coverage */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <CalendarCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-medium">Observed Temporal Span:</span>
          <span className="font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {report.min_date} to {report.max_date}
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Target Variable: <span className="font-mono text-cyan-400">rain_sum</span> (millimeters)
        </div>
      </div>

      {/* Cleaning Pipeline Audit Trail */}
      {report.actions_taken && report.actions_taken.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Trail of Preprocessing Actions</span>
          </h4>
          <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 max-h-32 overflow-y-auto space-y-1.5 font-mono text-xs">
            {report.actions_taken.map((action, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-slate-300 text-[11px]">
                <span className="text-cyan-500 font-bold shrink-0">[{idx + 1}]</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
