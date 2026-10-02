import React, { useState, useEffect } from 'react';
import {
  Binary,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen,
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
import type { DiscreteDistributionsResponse, ContinuousDistributionsResponse } from '../types';
import { fetchDiscreteDistributions, fetchContinuousDistributions } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface DistributionsPageProps {
  datasetKey: string;
}

export const DistributionsPage: React.FC<DistributionsPageProps> = ({ datasetKey }) => {
  const [activeTab, setActiveTab] = useState<'discrete' | 'continuous'>('discrete');

  // Discrete state
  const [nDays, setNDays] = useState<number>(14);
  const [heavyRainThreshold, setHeavyRainThreshold] = useState<number>(15.0);
  const [discreteData, setDiscreteData] = useState<DiscreteDistributionsResponse | null>(null);

  // Continuous state
  const [contVar, setContVar] = useState<string>('rain_sum');
  const [filterPos, setFilterPos] = useState<boolean>(true);
  const [selectedDist, setSelectedDist] = useState<string>('gamma');
  const [continuousData, setContinuousData] = useState<ContinuousDistributionsResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const loadDiscrete = async () => {
    setLoading(true);
    try {
      const res = await fetchDiscreteDistributions({
        dataset_key: datasetKey,
        n_days: nDays,
        rain_threshold: 1.0,
        heavy_rain_threshold: heavyRainThreshold,
      });
      setDiscreteData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadContinuous = async () => {
    setLoading(true);
    try {
      const res = await fetchContinuousDistributions({
        dataset_key: datasetKey,
        variable: contVar,
        filter_positive: filterPos,
        distributions: ['normal', 'gamma', 'exponential', 'uniform', 'beta'],
      });
      setContinuousData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discrete') {
      loadDiscrete();
    } else {
      loadContinuous();
    }
  }, [datasetKey, activeTab, nDays, heavyRainThreshold, contVar, filterPos]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Binary className="w-4 h-4" />
          <span>Modules IV & V • Probability Distributions Laboratory</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Discrete & Continuous Theoretical Distribution Fitting
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Studying Binomial and Poisson event counts, the law of rare events, moment generating functions,
          and continuous maximum likelihood estimation for Normal, Gamma, Exponential, Uniform, and Beta models.
        </p>

        {/* Tab Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('discrete')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'discrete'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Module IV: Discrete Distributions (Binomial & Poisson)</span>
          </button>
          <button
            onClick={() => setActiveTab('continuous')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'continuous'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Module V: Continuous Distributions (Normal, Gamma, Beta, etc.)</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeTab === 'discrete' && discreteData ? (
        <>
          {/* Controls for Discrete */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Binomial Trials n (Days):</span>
              <input
                type="number"
                min={5}
                max={30}
                value={nDays}
                onChange={(e) => setNDays(Math.max(5, Number(e.target.value)))}
                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Heavy Rain Event Threshold (mm):</span>
              <input
                type="number"
                min={5}
                max={50}
                value={heavyRainThreshold}
                onChange={(e) => setHeavyRainThreshold(Math.max(5, Number(e.target.value)))}
                className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          {/* Binomial vs Poisson Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Binomial Distribution Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Binomial(n = {discreteData.binomial.n_trials}, p = {discreteData.binomial.p_success})
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  Number of Rainy Days in {discreteData.binomial.n_trials}-Day Period
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {discreteData.binomial.interpretation}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center font-mono text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Mean np</span>
                    <div className="text-sm font-bold text-white mt-0.5">{discreteData.binomial.mean_np}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Variance npq</span>
                    <div className="text-sm font-bold text-cyan-400 mt-0.5">{discreteData.binomial.variance_npq}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Std Dev √npq</span>
                    <div className="text-sm font-bold text-white mt-0.5">{discreteData.binomial.std_dev}</div>
                  </div>
                </div>
              </div>

              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={discreteData.binomial.pmf_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="k" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'k (Rainy Days)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, 'Probability P(X=k)']}
                    />
                    <Bar dataKey="probability" fill="#06b6d4" radius={[4, 4, 0, 0]} name="P(X=k)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Poisson Distribution Card */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                  Poisson(λ = {discreteData.poisson.estimated_lambda})
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  Monthly Frequency of Heavy Rain (≥ {heavyRainThreshold} mm)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {discreteData.poisson.interpretation}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center font-mono text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Estimated λ</span>
                    <div className="text-sm font-bold text-white mt-0.5">{discreteData.poisson.estimated_lambda}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Observed Var</span>
                    <div className="text-sm font-bold text-sky-400 mt-0.5">{discreteData.poisson.observed_variance}</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Dispersion Var/λ</span>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">{discreteData.poisson.dispersion_ratio}</div>
                  </div>
                </div>
              </div>

              <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={discreteData.poisson.pmf_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="k" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'k (Heavy Events)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, 'Probability P(Y=k)']}
                    />
                    <Bar dataKey="probability" fill="#38bdf8" radius={[4, 4, 0, 0]} name="P(Y=k)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-cyan-400">Assumption Check:</strong> {discreteData.poisson.dispersion_evaluation}
              </div>
            </div>
          </div>

          {/* Binomial to Poisson Approximation (Law of Rare Events) */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Binary className="w-4 h-4 text-cyan-400" />
                  <span>Relationship Between Binomial and Poisson (Law of Rare Events)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {discreteData.binomial_to_poisson.description}
                </p>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                discreteData.binomial_to_poisson.rule_of_thumb_satisfied
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {discreteData.binomial_to_poisson.rule_of_thumb_satisfied ? '✓ Approximation Valid' : 'Caution: Moderate Probability'}
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discreteData.binomial_to_poisson.comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="k" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend />
                  <Bar dataKey="binomial_p" fill="#06b6d4" name="Binomial P(X=k)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="poisson_approx_p" fill="#f59e0b" name="Poisson Approx P(Y=k)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
              {discreteData.binomial_to_poisson.rule_of_thumb_explanation}
            </p>
          </div>

          {/* Moment Generating Functions Educational Panel */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-900/60 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <span>Moment Generating Function (MGF) Academic Foundations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="text-cyan-400 font-bold font-sans">Binomial MGF:</span>
                <div className="p-2 bg-slate-950 rounded text-cyan-300">{discreteData.moment_generating_functions.binomial.formula}</div>
                <div className="text-slate-300 font-sans text-[11px] space-y-1">
                  <div>• {discreteData.moment_generating_functions.binomial.derivation_mean}</div>
                  <div>• {discreteData.moment_generating_functions.binomial.derivation_variance}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="text-sky-400 font-bold font-sans">Poisson MGF:</span>
                <div className="p-2 bg-slate-950 rounded text-sky-300">{discreteData.moment_generating_functions.poisson.formula}</div>
                <div className="text-slate-300 font-sans text-[11px] space-y-1">
                  <div>• {discreteData.moment_generating_functions.poisson.derivation_mean}</div>
                  <div>• {discreteData.moment_generating_functions.poisson.derivation_variance}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'continuous' && continuousData ? (
        <>
          {/* Continuous Controls */}
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Target Variable:</span>
              <select
                value={contVar}
                onChange={(e) => setContVar(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              >
                <option value="rain_sum">rain_sum (Rainfall mm)</option>
                <option value="temperature_2m_mean">temperature_2m_mean (°C)</option>
                <option value="relative_humidity_2m_mean">relative_humidity_2m_mean (%)</option>
              </select>
            </div>

            {contVar === 'rain_sum' && (
              <label className="flex items-center space-x-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPos}
                  onChange={(e) => setFilterPos(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Fit only positive rain (&gt; 0 mm)</span>
              </label>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Inspected Distribution:</span>
              <select
                value={selectedDist}
                onChange={(e) => setSelectedDist(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
              >
                <option value="gamma">Gamma Distribution (Meteorological Standard)</option>
                <option value="normal">Normal / Gaussian Distribution</option>
                <option value="exponential">Exponential Distribution</option>
                <option value="beta">Beta Distribution (Bounded Domain)</option>
                <option value="uniform">Uniform Distribution (Baseline)</option>
              </select>
            </div>
          </div>

          {/* Continuous PDF Chart & Fit Diagnostics */}
          {continuousData.fitted_distributions[selectedDist] && (
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {continuousData.fitted_distributions[selectedDist].name} Fit Diagnostics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kolmogorov-Smirnov Test: D = {continuousData.fitted_distributions[selectedDist].ks_statistic}, p-value = {continuousData.fitted_distributions[selectedDist].ks_p_value}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                    N = {continuousData.sample_size} valid points
                  </span>
                </div>
              </div>

              {/* Scientific Suitability Alert Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold">Scientific Meteorological Suitability:</strong>
                  <span className="text-slate-300 leading-relaxed">
                    {continuousData.fitted_distributions[selectedDist].scientific_suitability}
                  </span>
                </div>
              </div>

              {/* PDF Overlay Chart */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">
                  Theoretical Probability Density Function f(x)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={continuousData.fitted_distributions[selectedDist].pdf_points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="x" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="pdf" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="Theoretical PDF f(x)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Parameters Breakdown */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-slate-400 font-semibold font-sans">Maximum Likelihood Estimated Parameters:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(continuousData.fitted_distributions[selectedDist].parameters).map(([key, val]) => (
                    <div key={key} className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">{key}</span>
                      <span className="text-cyan-300 font-bold">{val}</span>
                    </div>
                  ))}
                  {continuousData.fitted_distributions[selectedDist].mean !== undefined && (
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Theoretical Mean</span>
                      <span className="text-white font-bold">{continuousData.fitted_distributions[selectedDist].mean}</span>
                    </div>
                  )}
                  {continuousData.fitted_distributions[selectedDist].variance !== undefined && (
                    <div className="p-2 bg-slate-950 rounded border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Theoretical Variance</span>
                      <span className="text-white font-bold">{continuousData.fitted_distributions[selectedDist].variance}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Academic Formula Card */}
          <FormulaCard
            title="Module V Continuous Distribution Foundations"
            formula="Gamma: f(x) = [1 / (Γ(α)β^α)] x^(α-1) e^(-x/β)  |  Normal: f(x) = [1 / (σ√(2π))] e^(-(x-μ)² / (2σ²))"
            variables={[
              { symbol: 'α (shape), β (scale)', meaning: 'Gamma parameters modeling skewed rainfall depth' },
              { symbol: 'μ, σ', meaning: 'Normal distribution mean and standard deviation (symmetric)' },
              { symbol: 'KS Statistic D', meaning: 'Maximum absolute vertical distance between empirical and theoretical CDF' },
            ]}
            explanation="Never assume a weather dataset is normally distributed simply because a histogram appears single-peaked. Raw daily rainfall exhibits a spike at zero and strong right-skewness, making two-parameter Gamma or mixed Exponential distributions standard in atmospheric hydrology."
            academicNote="Viva question: Why is the Normal distribution invalid for raw daily precipitation? Answer: Because rainfall has a strict non-negative physical boundary (rain ≥ 0) and high skewness, whereas Normal domain is (-∞, +∞)."
          />
        </>
      ) : null}
    </div>
  );
};
