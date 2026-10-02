import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sliders,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
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
} from 'recharts';
import type { SamplingResponse, EstimationResponse, VarianceComparisonResponse } from '../types';
import { fetchSamplingSimulation, fetchEstimation, fetchVarianceComparison } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface SamplingPageProps {
  datasetKey: string;
}

export const SamplingPage: React.FC<SamplingPageProps> = ({ datasetKey }) => {
  const [selectedVar, setSelectedVar] = useState<string>('rain_sum');
  const [sampleSize, setSampleSize] = useState<number>(30);
  const [numSamples, setNumSamples] = useState<number>(300);
  const [method, setMethod] = useState<string>('srs');
  const [filterPos, setFilterPos] = useState<boolean>(false);

  const [samplingData, setSamplingData] = useState<SamplingResponse | null>(null);
  const [estData, setEstData] = useState<EstimationResponse | null>(null);
  const [fTestData, setFTestData] = useState<VarianceComparisonResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const [sampRes, estRes, fRes] = await Promise.all([
        fetchSamplingSimulation({
          dataset_key: datasetKey,
          variable: selectedVar,
          sample_size: sampleSize,
          num_samples: numSamples,
          method: method,
          filter_positive: filterPos,
        }),
        fetchEstimation({
          dataset_key: datasetKey,
          variable: selectedVar,
          rain_threshold: 1.0,
        }),
        fetchVarianceComparison({
          dataset_key: datasetKey,
          variable: selectedVar,
        }),
      ]);

      setSamplingData(sampRes);
      setEstData(estRes);
      setFTestData(fRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [datasetKey, selectedVar, sampleSize, numSamples, method, filterPos]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Module VI • Sampling Theory & Statistical Estimation</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Central Limit Theorem Simulation & Confidence Intervals
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Empirical demonstration of the Central Limit Theorem (CLT) on skewed meteorological data,
          point estimation, Student's t confidence intervals, Chi-squared variance intervals, and two-period F-tests.
        </p>

        {/* Simulation Controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Target Variable:</span>
            <select
              value={selectedVar}
              onChange={(e) => setSelectedVar(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
            >
              <option value="rain_sum">rain_sum (Rainfall mm)</option>
              <option value="temperature_2m_mean">temperature_2m_mean (°C)</option>
              <option value="relative_humidity_2m_mean">relative_humidity_2m_mean (%)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Sampling Scheme:</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono"
            >
              <option value="srs">Simple Random Sampling (SRS)</option>
              <option value="stratified">Stratified Sampling by Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Sample Size (n):</span>
            <input
              type="range"
              min={5}
              max={60}
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="font-mono text-cyan-400 font-bold">{sampleSize}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Num Repetitions (M):</span>
            <input
              type="range"
              min={100}
              max={600}
              step={50}
              value={numSamples}
              onChange={(e) => setNumSamples(Number(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="font-mono text-cyan-400 font-bold">{numSamples}</span>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition shadow"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Resimulate</span>
          </button>
        </div>
      </div>

      {loading || !samplingData || !estData ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* CLT Simulation Core Section */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-900/60 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Central Limit Theorem Laboratory: Sampling Distribution of the Sample Mean (x̄)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulating M = {samplingData.sampling_parameters.num_simulated_samples_M} independent samples of size n = {samplingData.sampling_parameters.sample_size_n}
                </p>
              </div>

              <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                samplingData.sampling_distribution.sampling_distribution_is_normal
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}>
                {samplingData.sampling_distribution.sampling_distribution_is_normal
                  ? '✓ Sampling Distribution Normalized (p > 0.05)'
                  : 'CLT Convergence in Progress'}
              </span>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 text-[11px]">Population Mean (μ)</span>
                <div className="text-lg font-bold text-white mt-1">
                  {samplingData.population_parameters.mean_mu}
                </div>
                <div className="text-[10px] text-slate-500">True parameter</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 text-[11px]">Mean of Sample Means (μ_x̄)</span>
                <div className="text-lg font-bold text-cyan-300 mt-1">
                  {samplingData.sampling_distribution.mean_of_sample_means}
                </div>
                <div className="text-[10px] text-emerald-400">Unbiased: E[X̄] = μ</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 text-[11px]">Theoretical SE (σ/√n)</span>
                <div className="text-lg font-bold text-sky-400 mt-1">
                  {samplingData.sampling_distribution.theoretical_standard_error}
                </div>
                <div className="text-[10px] text-slate-500">σ = {samplingData.population_parameters.std_sigma}</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 text-[11px]">Empirical SE (s_x̄)</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">
                  {samplingData.sampling_distribution.empirical_standard_error}
                </div>
                <div className="text-[10px] text-slate-500">Simulated spread</div>
              </div>
            </div>

            {/* Skewness reduction demonstration */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="text-slate-400">Population Skewness:</span>
                <strong className="text-amber-400 font-mono">g₁ = {samplingData.population_parameters.skewness}</strong>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Sampling Distribution Skewness:</span>
                <strong className="text-emerald-400 font-mono">g₁ = {samplingData.sampling_distribution.skewness_of_means}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Notice dramatic reduction toward 0 as sample size n increases!
              </div>
            </div>

            {/* Histogram of Sample Means Chart */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-300">
                Sampling Distribution Histogram of Sample Means (x̄)
              </h4>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={samplingData.sampling_distribution.histogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="mean_val" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Sample Mean x̄ (mm)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}`, 'Empirical Density']}
                    />
                    <Bar dataKey="density" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Density of Sample Means" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Point and Interval Estimation (Confidence Intervals) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CI for Mean using Student's t */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Confidence Intervals for Population Mean (μ)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Computed via Student's t-distribution with df = {estData.confidence_intervals_mean.degrees_of_freedom} (SE = {estData.confidence_intervals_mean.standard_error})
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {Object.entries(estData.confidence_intervals_mean.intervals).map(([level, val]) => (
                  <div key={level} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{level} Confidence</span>
                      <div className="text-[10px] text-slate-400 font-sans">t_crit = {val.critical_value_t} | Margin = ±{val.margin_of_error} mm</div>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-300 font-bold text-sm">[{val.lower_bound}, {val.upper_bound}]</span>
                      <span className="text-[10px] text-slate-400 block font-sans">mm/day</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-cyan-400">Interpretation:</strong> We are 95% confident that the true long-term population mean rainfall lies in [{estData.confidence_intervals_mean.intervals['95%'].lower_bound}, {estData.confidence_intervals_mean.intervals['95%'].upper_bound}] mm.
              </p>
            </div>

            {/* CI for Rainy Day Proportion & Chi2 Variance Interval */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  <span>Interval Estimation for Proportion (p) & Variance (σ²)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proportion CI (Standard Normal z) and Variance CI (Chi-squared χ²)
                </p>
              </div>

              {/* 95% Proportion CI */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>95% CI for Rainy Proportion (p):</span>
                  <strong className="text-sky-300">
                    [{(estData.confidence_intervals_proportion.intervals['95%'].lower_bound * 100).toFixed(1)}%, {(estData.confidence_intervals_proportion.intervals['95%'].upper_bound * 100).toFixed(1)}%]
                  </strong>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Point estimate p̂ = {(estData.confidence_intervals_proportion.intervals['95%'].point_estimate * 100).toFixed(1)}% (z = 1.96)
                </div>
              </div>

              {/* Chi2 Variance CI */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>95% CI for Population Variance (σ²):</span>
                  <strong className="text-emerald-400">
                    [{estData.confidence_interval_variance.ci_95_variance_lower.toFixed(2)}, {estData.confidence_interval_variance.ci_95_variance_upper.toFixed(2)}]
                  </strong>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Derived via χ² with df = {estData.confidence_interval_variance.degrees_of_freedom} (Sample s² = {estData.confidence_interval_variance.variance_point_estimate.toFixed(2)})
                </div>
              </div>

              {/* Two-Period F-test for Variances */}
              {fTestData && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">Two-Period F-Test for Variances:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fTestData.f_test.decision === 'Reject H0' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {fTestData.f_test.decision}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-cyan-400">
                    F = {fTestData.f_test.f_statistic} (df₁ = {fTestData.f_test.df_numerator}, df₂ = {fTestData.f_test.df_denominator}, p = {fTestData.f_test.p_value})
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    {fTestData.f_test.interpretation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Academic Formula Card */}
          <FormulaCard
            title="Module VI Sampling & Estimation Formulas"
            formula="SE = σ / √n  |  CI_mean: x̄ ± t_(α/2, n-1) · (s / √n)  |  CI_var: [(n-1)s² / χ²_(α/2), (n-1)s² / χ²_(1-α/2)]"
            variables={[
              { symbol: 'SE', meaning: 'Standard Error representing sample mean variability across repeated samples' },
              { symbol: 't_(α/2, n-1)', meaning: 'Student’s t critical value used when population σ is unknown' },
              { symbol: 'χ²', meaning: 'Chi-squared distribution used for constructing confidence intervals on variance' },
              { symbol: 'F = s₁² / s₂²', meaning: 'Snedecor’s F-statistic for comparing variances between two independent sample subsets' },
            ]}
            explanation="The Central Limit Theorem guarantees that the distribution of sample means approaches normality as sample size increases (n ≥ 30), regardless of how non-normal the underlying rainfall population is. Confidence intervals provide interval estimates with a specified confidence coefficient."
            academicNote="Viva tip: Why do we use the t-distribution instead of the standard normal z-distribution? Because the true population variance σ² is unknown and estimated from the sample using s²."
          />
        </>
      )}
    </div>
  );
};
