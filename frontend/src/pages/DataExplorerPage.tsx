import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Table as TableIcon } from 'lucide-react';
import type { HistoricalWeatherResponse } from '../types';
import { DataQualityPanel } from '../components/DataQualityPanel';
import { DataTable } from '../components/DataTable';
import { uploadWeatherFile } from '../services/api';

interface DataExplorerPageProps {
  weatherData: HistoricalWeatherResponse | null;
  locationName: string;
  onDataUpdated: (newData: HistoricalWeatherResponse) => void;
}

export const DataExplorerPage: React.FC<DataExplorerPageProps> = ({
  weatherData,
  locationName,
  onDataUpdated,
}) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!weatherData) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadMessage(null);
    setUploadError(null);

    try {
      const result = await uploadWeatherFile(file);
      setUploadMessage(`Successfully parsed ${result.total_records} rows from ${file.name} with automatic schema mapping.`);
      onDataUpdated(result);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse uploaded file.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <TableIcon className="w-4 h-4" />
          <span>Data Quality & Explorer Pipeline</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Meteorological Data Inspection & Preprocessing
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Complete transparent audit of data quality, missing value imputation, date sequence continuity,
          and tabular exploration of real historical observations.
        </p>
      </div>

      {/* Data Quality Panel */}
      <DataQualityPanel report={weatherData.quality_report} />

      {/* Optional Secondary Upload Section */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Secondary Dataset Upload (CSV / Excel)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Primary workflow uses real Open-Meteo ERA5 API data. Optionally upload custom rain-gauge data with automatic column mapping.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-white transition flex items-center space-x-2 shadow-sm">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>{uploadLoading ? 'Processing file...' : 'Choose CSV / Excel File'}</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploadLoading}
              className="hidden"
            />
          </label>

          <span className="text-xs text-slate-400">
            Supported columns: <code className="text-cyan-400">date</code>, <code className="text-cyan-400">rainfall / rain / rain_sum</code>, <code className="text-cyan-400">temperature</code>, <code className="text-cyan-400">humidity</code>, <code className="text-cyan-400">pressure</code>, <code className="text-cyan-400">wind_speed</code>
          </span>
        </div>

        {uploadMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Main Interactive Data Table */}
      <DataTable records={weatherData.records} locationName={locationName} />
    </div>
  );
};
