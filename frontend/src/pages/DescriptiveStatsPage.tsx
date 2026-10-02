import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  Sliders,
  ShieldCheck,
  TrendingDown,
  Percent,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DescriptiveStatsResponse } from '../types';
import { fetchDescriptiveStats } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface DescriptiveStatsPageProps {
  datasetKey: string;
}

export const DescriptiveStatsPage: React.FC<DescriptiveStatsPageProps> = ({ datasetKey }) => {
  const [selectedVar, setSelectedVar] = useState<string>('rain_sum');
  const [chebyshevK, setChebyshevK] = useState<number>(2.0);
  const [bins, setBins] = useState<number>(15);
  const [filterPositive, setFilterPositive] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<DescriptiveStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchDescriptiveStats({
        dataset_key: datasetKey,
        variable: selectedVar,
        chebyshev_k: chebyshevK,
        bins: bins,
        filter_positive: filterPositive,
      });
      setStatsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [datasetKey, selectedVar, chebyshevK, bins, filterPositive]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BarChart2 className="w-4 h-4" />
          <span>Module I • Introduction to Statistics</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Descriptive Statistics & Data Dispersion
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Analysis of central tendency, dispersion, frequency tables, histograms, cumulative ogives,
          stem-and-leaf plots, and Chebyshev's inequality.
        </p>

        {/* Controls Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          {/* Variable selection */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Variable:</span>
            <select
              value={selectedVar}
              onChange={(e) => setSelectedVar(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="rain_sum">rain_sum (Rainfall mm)</option>
              <option value="temperature_2m_mean">temperature_2m_mean (°C)</option>
              <option value="relative_humidity_2m_mean">relative_humidity_2m_mean (%)</option>
              <option value="pressure_msl_mean">pressure_msl_mean (hPa)</option>
              <option value="wind_speed_10m_max">wind_speed_10m_max (km/h)</option>
            </select>
          </div>

          {/* Filter positive rainfall */}
          {selectedVar === 'rain_sum' && (
            <label className="flex items-center space-x-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterPositive}
                onChange={(e) => setFilterPositive(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Filter strictly positive rain (&gt; 0 mm)</span>
            </label>
          )}

          {/* Bins count */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Histogram Bins:</span>
            <input
              type="range"
              min={8}
              max={30}
              value={bins}
              onChange={(e) => setBins(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="font-mono text-cyan-400">{bins}</span>
          </div>

          {/* Chebyshev k */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Chebyshev k:</span>
            <select
              value={chebyshevK}
              onChange={(e) => setChebyshevK(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
            >
              <option value={1.5}>k = 1.5</option>
              <option value={2.0}>k = 2.0</option>
              <option value={2.5}>k = 2.5</option>
              <option value={3.0}>k = 3.0</option>
            </select>
          </div>
        </div>
      </div>

      {loading || !statsData ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Central Tendency & Dispersion Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-[11px] text-slate-400">Sample Mean (x̄)</div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {statsData.central_tendency.mean}
              </div>
              <div className="text-[10px] text-slate-400">Σx / n</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-[11px] text-slate-400">Median (Q2)</div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {statsData.central_tendency.median}
              </div>
              <div className="text-[10px] text-slate-400">50th Percentile</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-[11px] text-slate-400">Sample Variance (s²)</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                {statsData.dispersion.variance_sample.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">ddof = 1</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-[11px] text-slate-400">Sample Std Dev (s)</div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {statsData.dispersion.std_sample.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">√s²</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-[11px] text-slate-400">Coeff of Var (CV)</div>
              <div className="text-lg font-bold font-mono text-amber-300 mt-1">
                {statsData.dispersion.coefficient_of_variation_pct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400">(s / x̄) × 100%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-[11px] text-slate-400">Skewness (g₁)</div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {statsData.dispersion.skewness.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">{statsData.dispersion.skewness > 0 ? 'Right Skewed' : 'Left Skewed'}</div>
            </div>
          </div>

          {/* Chebyshev Inequality Interactive Lab */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-900/60 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Chebyshev's Inequality Verification Laboratory</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                P(|X - μ| &lt; kσ) ≥ 1 - 1/k²
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">k Standard Deviations</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">{statsData.chebyshev.k.toFixed(1)}</div>
                <div className="text-[11px] text-slate-400 mt-1">Selected factor (k &gt; 1)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Chebyshev Lower Bound</span>
                <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                  ≥ {statsData.chebyshev.theoretical_lower_bound_pct}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">1 - 1/k² guarantee</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Actual Proportion in Range</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {statsData.chebyshev.actual_proportion_pct}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{statsData.chebyshev.actual_count} of {statsData.sample_size} days</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Interval [x̄ - ks, x̄ + ks]</span>
                <div className="text-sm font-bold font-mono text-cyan-300 mt-2">
                  [{statsData.chebyshev.interval_min.toFixed(1)}, {statsData.chebyshev.interval_max.toFixed(1)}]
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  ✓ Bound Validated
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
              <strong className="text-cyan-400">Academic Context:</strong> Chebyshev's inequality applies to <em>any</em> arbitrary probability distribution with finite variance, regardless of whether the data is bell-shaped or severely right-skewed like precipitation. While the Empirical 68-95-99.7 Rule requires a strictly Normal distribution, Chebyshev guarantees that at least {statsData.chebyshev.theoretical_lower_bound_pct}% of rainfall observations lie within {statsData.chebyshev.k} standard deviations.
            </p>
          </div>

          {/* Histogram & Ogive Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Histogram */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  <span>Frequency Histogram ({selectedVar})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class interval frequency counts across {bins} bins
                </p>
              </div>

              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.frequency_table} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="class_interval" stroke="#64748b" tick={{ fontSize: 9 }} interval={1} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} days`, 'Frequency']}
                    />
                    <Bar dataKey="frequency" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ogives (Cumulative Frequency Curves) */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-sky-400" />
                  <span>Cumulative Frequency Curves (Ogives)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Less-Than Ogive (cumulative from below) vs More-Than Ogive (reverse cumulative)
                </p>
              </div>

              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statsData.ogive} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="boundary" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="less_than_cum_freq" stroke="#06b6d4" strokeWidth={2} name="Less-Than Ogive" dot={false} />
                    <Line type="monotone" dataKey="more_than_cum_freq" stroke="#f59e0b" strokeWidth={2} name="More-Than Ogive" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Grouped Frequency Table */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Grouped Frequency Table</span>
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Class Interval</th>
                    <th className="px-4 py-2.5">Midpoint (x)</th>
                    <th className="px-4 py-2.5">Frequency (f)</th>
                    <th className="px-4 py-2.5">Rel Frequency</th>
                    <th className="px-4 py-2.5">Cumul Freq (cf)</th>
                    <th className="px-4 py-2.5">Cumul Rel Freq</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statsData.frequency_table.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2 text-white font-medium">{row.class_interval}</td>
                      <td className="px-4 py-2 text-slate-300">{row.midpoint}</td>
                      <td className="px-4 py-2 text-cyan-300 font-bold">{row.frequency}</td>
                      <td className="px-4 py-2 text-slate-400">{row.relative_frequency}</td>
                      <td className="px-4 py-2 text-sky-400">{row.cumulative_frequency}</td>
                      <td className="px-4 py-2 text-slate-400">{row.cumulative_relative_frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stem and Leaf Section */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>Stem-and-Leaf Plot Representation</span>
            </h3>
            {statsData.stem_and_leaf?.supported ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                <div className="text-[11px] text-slate-400 mb-2">Leaf Unit = {statsData.stem_and_leaf.leaf_unit}</div>
                {statsData.stem_and_leaf.stems?.map((s, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span className="w-8 text-right text-cyan-400 font-bold">{s.stem} |</span>
                    <span className="text-slate-200">{s.leaves.join(' ')}</span>
                    <span className="text-slate-500 text-[10px]">({s.frequency})</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Statistical Representation Note: </span>
                {statsData.stem_and_leaf?.reason}
              </div>
            )}
          </div>

          {/* Academic Formula Card */}
          <FormulaCard
            title="Module I Core Mathematical Formulas"
            formula="x̄ = (1/n) ∑ x_i  |  s² = [1/(n-1)] ∑ (x_i - x̄)²  |  P(|X - μ| < kσ) ≥ 1 - 1/k²"
            variables={[
              { symbol: 'x̄', meaning: 'Sample arithmetic mean' },
              { symbol: 's²', meaning: 'Sample variance (Bessel-corrected with n - 1 degrees of freedom)' },
              { symbol: 'k', meaning: 'Number of standard deviations away from the mean (k > 1)' },
              { symbol: 'g₁', meaning: 'Fisher-Pearson skewness coefficient' },
            ]}
            explanation="Measures of central tendency locate the distribution balance point, while dispersion measures quantify spread. For asymmetric rainfall data, sample median and IQR provide robust non-parametric alternatives to the mean and standard deviation."
            academicNote="In viva examinations, explain why Bessel's correction (dividing by n - 1 rather than N) provides an unbiased estimator for population variance σ²."
          />
        </>
      )}
    </div>
  );
};
