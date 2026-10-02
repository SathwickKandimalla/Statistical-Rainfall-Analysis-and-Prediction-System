import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  Sliders,
  AlertCircle,
  TrendingUp,
  ScatterChart as ScatterIcon,
  Layers,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import type { CorrelationResponse } from '../types';
import { fetchCorrelation } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface CorrelationPageProps {
  datasetKey: string;
}

export const CorrelationPage: React.FC<CorrelationPageProps> = ({ datasetKey }) => {
  const [varX, setVarX] = useState<string>('relative_humidity_2m_mean');
  const [varY, setVarY] = useState<string>('rain_sum');
  const [corrData, setCorrData] = useState<CorrelationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadCorrelation = async () => {
    setLoading(true);
    try {
      const res = await fetchCorrelation({
        dataset_key: datasetKey,
        var_x: varX,
        var_y: varY,
      });
      setCorrData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorrelation();
  }, [datasetKey, varX, varY]);

  const getHeatmapColor = (r: number) => {
    if (r === 1) return 'bg-cyan-600/40 text-cyan-200';
    if (r > 0.6) return 'bg-cyan-700/50 text-cyan-200';
    if (r > 0.3) return 'bg-cyan-900/60 text-cyan-300';
    if (r > 0.0) return 'bg-slate-800 text-slate-300';
    if (r > -0.3) return 'bg-slate-800 text-slate-300';
    if (r > -0.6) return 'bg-rose-950/60 text-rose-300';
    return 'bg-rose-900/60 text-rose-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <GitCommit className="w-4 h-4" />
          <span>Module IX • Correlation & Covariance Analysis</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Linear & Monotonic Association Between Weather Factors
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Quantifying statistical relationships across rainfall, temperature, relative humidity,
          sea-level pressure, and wind speed using Pearson correlation (r), Spearman rank correlation (ρ), and covariance.
        </p>

        {/* Warning Banner: Correlation != Causation */}
        <div className="mt-4 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-start space-x-3 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block font-semibold">Critical Statistical Rule: Correlation Does NOT Imply Causation</strong>
            <span>
              A high correlation between relative humidity and rainfall indicates strong mutual co-variation under atmospheric thermodynamic processes, but does not alone prove a single direct causal pathway.
            </span>
          </div>
        </div>

        {/* Variable Pair Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Independent Variable (X):</span>
            <select
              value={varX}
              onChange={(e) => setVarX(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
            >
              <option value="relative_humidity_2m_mean">relative_humidity_2m_mean (%)</option>
              <option value="temperature_2m_mean">temperature_2m_mean (°C)</option>
              <option value="pressure_msl_mean">pressure_msl_mean (hPa)</option>
              <option value="wind_speed_10m_max">wind_speed_10m_max (km/h)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Dependent Variable (Y):</span>
            <select
              value={varY}
              onChange={(e) => setVarY(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
            >
              <option value="rain_sum">rain_sum (Rainfall mm)</option>
              <option value="temperature_2m_mean">temperature_2m_mean (°C)</option>
              <option value="relative_humidity_2m_mean">relative_humidity_2m_mean (%)</option>
            </select>
          </div>
        </div>
      </div>

      {loading || !corrData ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Pairwise Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Pearson Correlation (r)</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {corrData.pairwise_analysis.pearson_r.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono">
                p = {corrData.pairwise_analysis.pearson_p_value.toExponential(2)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Spearman Rank (ρ)</span>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                {corrData.pairwise_analysis.spearman_rho.toFixed(3)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Non-parametric rank test</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Sample Covariance</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {corrData.pairwise_analysis.covariance.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Units: X · Y</div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs text-slate-400">Relationship Type</span>
              <div className="text-base font-bold text-white mt-1">
                {corrData.pairwise_analysis.strength} {corrData.pairwise_analysis.direction}
              </div>
              <div className="text-[10px] text-cyan-400 mt-1">Trend Slope = {corrData.pairwise_analysis.trend_slope}</div>
            </div>
          </div>

          {/* Scatter Plot with Trend Line */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ScatterIcon className="w-4 h-4 text-cyan-400" />
                  <span>Pairwise Scatter Diagram with Fitted Trend Line</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {varY} vs {varX} (Trend: y = {corrData.pairwise_analysis.trend_slope}x + {corrData.pairwise_analysis.trend_intercept})
                </p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="x" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: varX, position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                  <YAxis dataKey="y" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: varY, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`${val}`, name === 'y' ? varY : varX]}
                  />
                  <Scatter name="Observations" data={corrData.pairwise_analysis.scatter_data} fill="#06b6d4" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-cyan-400">Interpretation: </strong>
              {corrData.pairwise_analysis.interpretation}
            </div>
          </div>

          {/* Correlation Matrix & Heatmap */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Full Meteorological Correlation Matrix (Pearson r)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-xl font-mono text-xs">
              <table className="w-full text-center">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Variable</th>
                    {corrData.selected_variables.map((v) => (
                      <th key={v} className="px-3 py-2.5 truncate max-w-[120px]">{v.replace('_2m_mean', '').replace('_10m_max', '')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {corrData.selected_variables.map((v1) => (
                    <tr key={v1}>
                      <td className="px-3 py-2.5 text-left text-slate-300 font-semibold truncate max-w-[140px] font-sans">
                        {v1}
                      </td>
                      {corrData.selected_variables.map((v2) => {
                        const r = corrData.correlation_matrix_pearson[v1]?.[v2] ?? 0;
                        return (
                          <td key={v2} className="px-3 py-2.5">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getHeatmapColor(r)}`}>
                              {r.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Formula Card */}
          <FormulaCard
            title="Module IX Correlation & Covariance Formulas"
            formula="r = Cov(X,Y) / (s_X · s_Y)  |  ρ = 1 - [6 ∑ d_i² / (n(n² - 1))]  |  Cov(X,Y) = [1/(n-1)] ∑ (x_i - x̄)(y_i - ȳ)"
            variables={[
              { symbol: 'r', meaning: 'Pearson product-moment correlation coefficient (-1 ≤ r ≤ +1)' },
              { symbol: 'ρ (rho)', meaning: 'Spearman rank correlation coefficient based on ordinal ranks' },
              { symbol: 'd_i', meaning: 'Difference between ranks of corresponding X and Y observations' },
              { symbol: 'Cov(X,Y)', meaning: 'Sample covariance measuring joint direction of variability' },
            ]}
            explanation="Pearson r measures strictly linear relationships and assumes bivariate normality without extreme outliers. Spearman ρ transforms data into monotonic ranks, making it much more robust against intense precipitation spikes."
            academicNote="Viva question: Why is Spearman often preferred over Pearson for rainfall analysis? Because daily precipitation distributions are non-linear and heavily right-skewed with extreme peak values."
          />
        </>
      )}
    </div>
  );
};
