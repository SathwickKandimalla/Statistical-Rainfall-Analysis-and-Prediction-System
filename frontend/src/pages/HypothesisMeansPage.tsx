import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Scale,
  Info,
} from 'lucide-react';
import type { HypothesisMeanResponse } from '../types';
import { fetchHypothesisMean } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface HypothesisMeansPageProps {
  datasetKey: string;
}

export const HypothesisMeansPage: React.FC<HypothesisMeansPageProps> = ({ datasetKey }) => {
  const [meanVar, setMeanVar] = useState<string>('rain_sum');
  const [refMean, setRefMean] = useState<number>(3.0);
  const [meanAlpha, setMeanAlpha] = useState<number>(0.05);
  const [meanAlt, setMeanAlt] = useState<string>('two-sided');
  const [meanTestResult, setMeanTestResult] = useState<HypothesisMeanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runMeanTest = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runMeanTest();
  }, [datasetKey, meanVar, refMean, meanAlpha, meanAlt]);

  const isReject = meanTestResult?.decision === 'Reject H0';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ── */}
      <div className="sci-page-header">
        <div className="sci-module-badge" style={{ '--badge-color': '#f59e0b' } as React.CSSProperties}>
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Module VII • Hypothesis Testing — Means</span>
        </div>
        <h1 className="sci-page-title">
          One-Sample Student's <em>t</em>-Test for Population Mean
        </h1>
        <p className="sci-page-subtitle">
          Formal statistical evaluation of whether the observed sample mean of a meteorological variable differs
          significantly from a specified historical or climatological reference value μ₀.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Running t-test...</span>
        </div>
      ) : (
        <>
          {/* ── Test Configuration ── */}
          <section className="sci-section">
            <div className="sci-section-header">
              <h2 className="sci-section-title">Test Parameters</h2>
              <p className="sci-section-desc">Configure the null hypothesis, significance level and alternative direction.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sci-input-group">
                <label className="sci-label">Inspected Variable</label>
                <select
                  value={meanVar}
                  onChange={(e) => setMeanVar(e.target.value)}
                  className="sci-select"
                >
                  <option value="rain_sum">rain_sum — Rainfall (mm)</option>
                  <option value="temperature_2m_mean">temperature_2m_mean — Temp (°C)</option>
                  <option value="relative_humidity_2m_mean">relative_humidity_2m_mean — RH (%)</option>
                </select>
              </div>

              <div className="sci-input-group">
                <label className="sci-label">Reference Mean (μ₀)</label>
                <input
                  type="number"
                  step={0.5}
                  value={refMean}
                  onChange={(e) => setRefMean(Number(e.target.value))}
                  className="sci-input"
                />
              </div>

              <div className="sci-input-group">
                <label className="sci-label">Significance Level (α)</label>
                <select
                  value={meanAlpha}
                  onChange={(e) => setMeanAlpha(Number(e.target.value))}
                  className="sci-select"
                >
                  <option value={0.01}>α = 0.01 (99% Confidence)</option>
                  <option value={0.05}>α = 0.05 (95% Confidence)</option>
                  <option value={0.10}>α = 0.10 (90% Confidence)</option>
                </select>
              </div>

              <div className="sci-input-group">
                <label className="sci-label">Alternative Hypothesis (H₁)</label>
                <select
                  value={meanAlt}
                  onChange={(e) => setMeanAlt(e.target.value)}
                  className="sci-select"
                >
                  <option value="two-sided">Two-Sided: μ ≠ μ₀</option>
                  <option value="greater">Right-Tailed: μ &gt; μ₀</option>
                  <option value="less">Left-Tailed: μ &lt; μ₀</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Hypotheses Display ── */}
          {meanTestResult && (
            <>
              <section className="sci-section border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                <div className="sci-section-header border-b border-slate-800 pb-4 mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="sci-section-title">Hypothesis Statements</h2>
                      <p className="sci-section-desc">Formally stated null and alternative hypotheses.</p>
                    </div>
                    <div className={`sci-decision-badge ${isReject ? 'sci-decision-reject' : 'sci-decision-fail'}`}>
                      {isReject ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{meanTestResult.decision}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="sci-hypothesis-box sci-hypothesis-null">
                    <span className="sci-hyp-label">Null Hypothesis H₀</span>
                    <p className="sci-hyp-statement font-mono">{meanTestResult.hypotheses.null}</p>
                  </div>
                  <div className="sci-hypothesis-box sci-hypothesis-alt">
                    <span className="sci-hyp-label">Alternative Hypothesis H₁</span>
                    <p className="sci-hyp-statement font-mono text-amber-300">{meanTestResult.hypotheses.alternative}</p>
                  </div>
                </div>

                {/* ── Key Metrics Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sci-metric-card">
                    <span className="sci-metric-label">Sample Mean (x̄)</span>
                    <div className="sci-metric-value text-white">{meanTestResult.sample_mean_x_bar}</div>
                    <div className="sci-metric-sub">vs μ₀ = {meanTestResult.reference_mean_mu0}</div>
                  </div>

                  <div className="sci-metric-card">
                    <span className="sci-metric-label">t-Statistic</span>
                    <div className="sci-metric-value text-amber-300">{meanTestResult.test_details.test_statistic_t}</div>
                    <div className="sci-metric-sub">df = {meanTestResult.test_details.degrees_of_freedom}</div>
                  </div>

                  <div className="sci-metric-card">
                    <span className="sci-metric-label">Critical Value (t_crit)</span>
                    <div className="sci-metric-value text-slate-200">{meanTestResult.test_details.critical_value}</div>
                    <div className="sci-metric-sub">at α = {meanAlpha}</div>
                  </div>

                  <div className="sci-metric-card">
                    <span className="sci-metric-label">p-Value</span>
                    <div className={`sci-metric-value ${meanTestResult.test_details.p_value <= meanAlpha ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {meanTestResult.test_details.p_value}
                    </div>
                    <div className="sci-metric-sub">
                      {meanTestResult.test_details.p_value <= meanAlpha ? '≤ α  — Significant' : '> α  — Not Significant'}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── Formal Conclusion Panel ── */}
              <div className={`sci-result-panel ${isReject ? 'sci-result-reject' : 'sci-result-fail'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${isReject ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'}`}>
                    {isReject ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Formal Statistical Conclusion
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{meanTestResult.interpretation}</p>
                  </div>
                </div>
              </div>

              {/* ── Student-Friendly Interpretation ── */}
              <div className="sci-info-panel">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Student-Friendly Interpretation</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isReject
                    ? `At the ${(meanAlpha * 100).toFixed(0)}% significance level, the evidence is strong enough to conclude that the true population mean is statistically different from the reference value μ₀ = ${meanTestResult.reference_mean_mu0}. In other words, if H₀ were true, a result this extreme (or more extreme) would occur only ${(meanTestResult.test_details.p_value * 100).toFixed(2)}% of the time by chance alone — far less than our ${(meanAlpha * 100).toFixed(0)}% threshold.`
                    : `At the ${(meanAlpha * 100).toFixed(0)}% significance level, we do NOT have sufficient statistical evidence to conclude the mean differs from μ₀ = ${meanTestResult.reference_mean_mu0}. The p-value of ${meanTestResult.test_details.p_value} exceeds our threshold α = ${meanAlpha}. Important: this does NOT prove H₀ is true — we simply cannot reject it with the available sample evidence.`
                  }
                </p>
              </div>
            </>
          )}

          {/* ── Error Theory Reference ── */}
          <section className="sci-section">
            <div className="sci-section-header border-b border-slate-800 pb-4 mb-5">
              <h2 className="sci-section-title flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                Decision Errors in Hypothesis Testing
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
                <div className="text-rose-400 font-bold text-sm mb-1.5">Type I Error (α — False Positive)</div>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  Rejecting H₀ when it is actually true. In rainfall analysis: concluding that the mean shifted when observed variation was purely random sampling fluctuation. Controlled at the chosen significance level α.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                <div className="text-amber-400 font-bold text-sm mb-1.5">Type II Error (β — False Negative)</div>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  Failing to reject H₀ when it is false. Missing a real climatic shift in average rainfall depth. Test power (1 − β) measures our ability to correctly detect a false null hypothesis.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-amber-400">Viva Rule:</strong> Never state that a high p-value &ldquo;proves H₀ is true.&rdquo; Always write{' '}
              <code className="text-amber-300 font-mono font-bold bg-amber-950/30 px-1 rounded">Fail to reject H₀</code>
              {' '}— absence of evidence is not evidence of absence.
            </div>
          </section>

          {/* ── Formula Card ── */}
          <FormulaCard
            title="Module VII — One-Sample t-Test Formula"
            formula="t = (x̄ − μ₀) / (s / √n)     df = n − 1     p-value = P(T ≥ |t_calc| | H₀)"
            variables={[
              { symbol: 't', meaning: "Student's t test statistic with n − 1 degrees of freedom" },
              { symbol: 'x̄', meaning: 'Sample mean of the selected meteorological variable' },
              { symbol: 'μ₀', meaning: 'Reference (null hypothesis) mean value' },
              { symbol: 's', meaning: 'Sample standard deviation' },
              { symbol: 'p-value', meaning: 'Probability of observing results this extreme or more, assuming H₀ is true' },
              { symbol: 'α', meaning: 'Significance level — probability threshold for Type I error' },
            ]}
            explanation="The one-sample t-test evaluates whether sample evidence is statistically incompatible with a specified null benchmark H₀. When p-value ≤ α, we reject H₀ at the chosen significance level."
            academicNote="Two-tailed test splits α/2 into each tail. A right-tailed test (μ > μ₀) concentrates rejection region in the upper tail only. Always specify the direction before observing data."
          />
        </>
      )}
    </div>
  );
};
