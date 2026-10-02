import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  ArrowRight,
} from 'lucide-react';
import type { HypothesisMeanResponse, HypothesisPropResponse } from '../types';
import { fetchHypothesisMean, fetchHypothesisProp } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface HypothesisPageProps {
  datasetKey: string;
}

export const HypothesisPage: React.FC<HypothesisPageProps> = ({ datasetKey }) => {
  // Mean test state
  const [meanVar, setMeanVar] = useState<string>('rain_sum');
  const [refMean, setRefMean] = useState<number>(3.0);
  const [meanAlpha, setMeanAlpha] = useState<number>(0.05);
  const [meanAlt, setMeanAlt] = useState<string>('two-sided');
  const [meanTestResult, setMeanTestResult] = useState<HypothesisMeanResponse | null>(null);

  // Proportion test state
  const [propThreshold, setPropThreshold] = useState<number>(1.0);
  const [refProp, setRefProp] = useState<number>(0.25);
  const [propAlpha, setPropAlpha] = useState<number>(0.05);
  const [propAlt, setPropAlt] = useState<string>('two-sided');
  const [propTestResult, setPropTestResult] = useState<HypothesisPropResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const runMeanTest = async () => {
    try {
      const res = await fetchHypothesisMean({
        dataset_key: datasetKey,
        variable: meanVar,
        reference_mean: refMean,
        alpha: meanAlpha,
        alternative: meanAlt,
      });
      setMeanTestResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  const runPropTest = async () => {
    try {
      const res = await fetchHypothesisProp({
        dataset_key: datasetKey,
        rain_threshold: propThreshold,
        reference_proportion: refProp,
        alpha: propAlpha,
        alternative: propAlt,
      });
      setPropTestResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([runMeanTest(), runPropTest()]).finally(() => setLoading(false));
  }, [datasetKey, meanVar, refMean, meanAlpha, meanAlt, propThreshold, refProp, propAlpha, propAlt]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Modules VII & VIII • Statistical Hypothesis Testing</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Hypothesis Testing for Means & Proportions
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Formal statistical hypothesis testing applying one-sample Student's t-test to evaluate weather means
          and one-sample Z-test to evaluate rainy day proportions against historical climatological baselines.
        </p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Module VII: Hypothesis Testing for Mean */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Module VII: Means
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  One-Sample Student's t-Test for Meteorological Mean (μ)
                </h3>
              </div>

              {meanTestResult && (
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
                  meanTestResult.decision === 'Reject H0'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}>
                  {meanTestResult.decision === 'Reject H0' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{meanTestResult.decision}</span>
                </span>
              )}
            </div>

            {/* Test Configuration Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Inspected Variable:</label>
                <select
                  value={meanVar}
                  onChange={(e) => setMeanVar(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                >
                  <option value="rain_sum">rain_sum (Rainfall mm)</option>
                  <option value="temperature_2m_mean">temperature_2m_mean (°C)</option>
                  <option value="relative_humidity_2m_mean">relative_humidity_2m_mean (%)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Baseline Reference (μ₀):</label>
                <input
                  type="number"
                  step={0.5}
                  value={refMean}
                  onChange={(e) => setRefMean(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Significance Level (α):</label>
                <select
                  value={meanAlpha}
                  onChange={(e) => setMeanAlpha(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                >
                  <option value={0.01}>α = 0.01 (99% Confidence)</option>
                  <option value={0.05}>α = 0.05 (95% Confidence)</option>
                  <option value={0.10}>α = 0.10 (90% Confidence)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Alternative Hypothesis (H₁):</label>
                <select
                  value={meanAlt}
                  onChange={(e) => setMeanAlt(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                >
                  <option value="two-sided">Two-Sided (μ ≠ μ₀)</option>
                  <option value="greater">Right-Tailed (μ &gt; μ₀)</option>
                  <option value="less">Left-Tailed (μ &lt; μ₀)</option>
                </select>
              </div>
            </div>

            {/* Test Results Output */}
            {meanTestResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Hypotheses</span>
                    <div className="text-slate-200 mt-0.5">{meanTestResult.hypotheses.null}</div>
                    <div className="text-cyan-400 font-semibold">{meanTestResult.hypotheses.alternative}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Sample Mean vs Reference</span>
                    <div className="text-white font-bold mt-0.5">x̄ = {meanTestResult.sample_mean_x_bar}</div>
                    <div className="text-slate-400 text-[10px]">μ₀ = {meanTestResult.reference_mean_mu0}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">t-Statistic (df = {meanTestResult.test_details.degrees_of_freedom})</span>
                    <div className="text-cyan-300 font-bold mt-0.5">t = {meanTestResult.test_details.test_statistic_t}</div>
                    <div className="text-slate-400 text-[10px]">t_crit = {meanTestResult.test_details.critical_value}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">p-Value</span>
                    <div className={`text-sm font-bold mt-0.5 ${meanTestResult.test_details.p_value <= meanAlpha ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {meanTestResult.test_details.p_value}
                    </div>
                    <div className="text-slate-400 text-[10px]">α = {meanAlpha}</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                  <strong className="text-cyan-400">Formal Statistical Conclusion: </strong>
                  {meanTestResult.interpretation}
                </div>
              </div>
            )}
          </div>

          {/* Module VIII: Hypothesis Testing for Proportions */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                  Module VIII: Proportions
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  One-Sample Z-Test for Rainy-Day Proportion (p)
                </h3>
              </div>

              {propTestResult && (
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${
                  propTestResult.decision === 'Reject H0'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}>
                  {propTestResult.decision === 'Reject H0' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{propTestResult.decision}</span>
                </span>
              )}
            </div>

            {/* Proportion Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rainy Day Threshold (mm):</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={propThreshold}
                  onChange={(e) => setPropThreshold(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Baseline Proportion (p₀):</label>
                <input
                  type="number"
                  min={0.01}
                  max={0.99}
                  step={0.05}
                  value={refProp}
                  onChange={(e) => setRefProp(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Significance Level (α):</label>
                <select
                  value={propAlpha}
                  onChange={(e) => setPropAlpha(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                >
                  <option value={0.01}>α = 0.01</option>
                  <option value={0.05}>α = 0.05</option>
                  <option value={0.10}>α = 0.10</option>
                </select>
              </div>
            </div>

            {/* Proportion Output */}
            {propTestResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Hypotheses</span>
                    <div className="text-slate-200 mt-0.5">{propTestResult.hypotheses.null}</div>
                    <div className="text-sky-400 font-semibold">{propTestResult.hypotheses.alternative}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Observed vs Baseline</span>
                    <div className="text-white font-bold mt-0.5">p̂ = {(propTestResult.sample_proportion_p_hat * 100).toFixed(1)}%</div>
                    <div className="text-slate-400 text-[10px]">p₀ = {(propTestResult.reference_proportion_p0 * 100).toFixed(1)}%</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Z-Statistic</span>
                    <div className="text-sky-300 font-bold mt-0.5">z = {propTestResult.test_details.test_statistic_z}</div>
                    <div className="text-slate-400 text-[10px]">z_crit = {propTestResult.test_details.critical_value}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">p-Value</span>
                    <div className={`text-sm font-bold mt-0.5 ${propTestResult.test_details.p_value <= propAlpha ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {propTestResult.test_details.p_value}
                    </div>
                    <div className="text-slate-400 text-[10px]">Decision: {propTestResult.decision}</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                  <strong className="text-sky-400">Formal Proportion Conclusion: </strong>
                  {propTestResult.interpretation}
                </div>
              </div>
            )}
          </div>

          {/* Educational Error Theory Card */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-900/60 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              <span>Type I & Type II Decision Errors in Hypothesis Testing</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-rose-400 font-bold block">Type I Error (α - False Positive):</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Rejecting the null hypothesis H₀ when it is actually true. In rainfall analysis, concluding rainfall patterns have significantly shifted when the observed variation was merely random sampling fluctuations. Controlled at significance level α.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-amber-400 font-bold block">Type II Error (β - False Negative):</span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Failing to reject the null hypothesis H₀ when it is false. Failing to detect a real climatic shift in average rainfall depth or rainy day frequency. The power of the test (1 - β) measures our ability to correctly reject a false null.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-cyan-400">Viva Examination Rule:</strong> Never claim that a high p-value "proves the null hypothesis is true". We strictly state <code className="text-cyan-300 font-mono font-bold">Fail to reject H₀</code> because absence of evidence is not evidence of absence.
            </div>
          </div>

          {/* Academic Formula Card */}
          <FormulaCard
            title="Modules VII & VIII Hypothesis Testing Formulas"
            formula="t = (x̄ - μ₀) / (s / √n)  |  z = (p̂ - p₀) / √[p₀(1 - p₀) / n]  |  p-value = P(T ≥ |t_calc| | H₀)"
            variables={[
              { symbol: 't', meaning: "Student's t test statistic with n - 1 degrees of freedom" },
              { symbol: 'z', meaning: 'Standard normal test statistic for proportions' },
              { symbol: 'p-value', meaning: 'Probability of obtaining results at least as extreme assuming H₀ is true' },
              { symbol: 'α', meaning: 'Significance level / probability threshold for Type I error' },
            ]}
            explanation="Hypothesis testing evaluates whether empirical sample evidence is statistically incompatible with a specified null benchmark H₀. If the p-value is less than or equal to α, H₀ is rejected."
            academicNote="During viva, clearly distinguish one-tailed vs two-tailed tests: a two-tailed test checks for any difference in either direction (μ ≠ μ₀), splitting α into α/2 in each tail."
          />
        </>
      )}
    </div>
  );
};
