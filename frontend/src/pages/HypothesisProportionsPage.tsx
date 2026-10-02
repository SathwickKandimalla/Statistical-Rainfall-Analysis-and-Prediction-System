import React, { useState, useEffect } from 'react';
import {
  Percent,
  CheckCircle2,
  XCircle,
  Scale,
  Info,
} from 'lucide-react';
import type { HypothesisPropResponse } from '../types';
import { fetchHypothesisProp } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface HypothesisProportionsPageProps {
  datasetKey: string;
}

export const HypothesisProportionsPage: React.FC<HypothesisProportionsPageProps> = ({ datasetKey }) => {
  const [propThreshold, setPropThreshold] = useState<number>(1.0);
  const [refProp, setRefProp] = useState<number>(0.25);
  const [propAlpha, setPropAlpha] = useState<number>(0.05);
  const [propAlt, setPropAlt] = useState<string>('two-sided');
  const [propTestResult, setPropTestResult] = useState<HypothesisPropResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runPropTest = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPropTest();
  }, [datasetKey, propThreshold, refProp, propAlpha, propAlt]);

  const isReject = propTestResult?.decision === 'Reject H0';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ── */}
      <div className="sci-page-header">
        <div className="sci-module-badge" style={{ '--badge-color': '#f59e0b' } as React.CSSProperties}>
          <Percent className="w-3.5 h-3.5" />
          <span>Module VIII • Hypothesis Testing — Proportions</span>
        </div>
        <h1 className="sci-page-title">
          One-Sample <em>Z</em>-Test for Population Proportion
        </h1>
        <p className="sci-page-subtitle">
          Formal statistical evaluation of whether the observed proportion of rainy days (days with rainfall above
          a defined threshold) differs significantly from a reference climatological proportion p₀.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Running Z-test...</span>
        </div>
      ) : (
        <>
          {/* ── Test Configuration ── */}
          <section className="sci-section">
            <div className="sci-section-header">
              <h2 className="sci-section-title">Test Parameters</h2>
              <p className="sci-section-desc">Define the rainy-day threshold, null proportion, significance level and alternative direction.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sci-input-group">
                <label className="sci-label">Rainy-Day Threshold (mm)</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={propThreshold}
                  onChange={(e) => setPropThreshold(Number(e.target.value))}
                  className="sci-input"
                />
                <p className="text-[10px] text-slate-500 mt-1">Days with rain ≥ this value count as "rainy"</p>
              </div>

              <div className="sci-input-group">
                <label className="sci-label">Reference Proportion (p₀)</label>
                <input
                  type="number"
                  min={0.01}
                  max={0.99}
                  step={0.05}
                  value={refProp}
                  onChange={(e) => setRefProp(Number(e.target.value))}
                  className="sci-input"
                />
                <p className="text-[10px] text-slate-500 mt-1">Historical/climatological baseline proportion</p>
              </div>

              <div className="sci-input-group">
                <label className="sci-label">Significance Level (α)</label>
                <select
                  value={propAlpha}
                  onChange={(e) => setPropAlpha(Number(e.target.value))}
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
                  value={propAlt}
                  onChange={(e) => setPropAlt(e.target.value)}
                  className="sci-select"
                >
                  <option value="two-sided">Two-Sided: p ≠ p₀</option>
                  <option value="greater">Right-Tailed: p &gt; p₀</option>
                  <option value="less">Left-Tailed: p &lt; p₀</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Results ── */}
          {propTestResult && (
            <>
              <section className="sci-section border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                <div className="sci-section-header border-b border-slate-800 pb-4 mb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="sci-section-title">Hypothesis Statements</h2>
                      <p className="sci-section-desc">Formally stated null and alternative hypotheses for rainy-day proportion.</p>
                    </div>
                    <div className={`sci-decision-badge ${isReject ? 'sci-decision-reject' : 'sci-decision-fail'}`}>
                      {isReject ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>{propTestResult.decision}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="sci-hypothesis-box sci-hypothesis-null">
                    <span className="sci-hyp-label">Null Hypothesis H₀</span>
                    <p className="sci-hyp-statement font-mono">{propTestResult.hypotheses.null}</p>
                  </div>
                  <div className="sci-hypothesis-box sci-hypothesis-alt">
                    <span className="sci-hyp-label">Alternative Hypothesis H₁</span>
                    <p className="sci-hyp-statement font-mono text-amber-300">{propTestResult.hypotheses.alternative}</p>
                  </div>
                </div>

                {/* ── Key Metrics Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="sci-metric-card">
                    <span className="sci-metric-label">Sample Proportion (p̂)</span>
                    <div className="sci-metric-value text-white">
                      {(propTestResult.sample_proportion_p_hat * 100).toFixed(1)}%
                    </div>
                    <div className="sci-metric-sub">p₀ = {(propTestResult.reference_proportion_p0 * 100).toFixed(1)}%</div>
                  </div>

                  <div className="sci-metric-card">
                    <span className="sci-metric-label">Z-Statistic</span>
                    <div className="sci-metric-value text-amber-300">{propTestResult.test_details.test_statistic_z}</div>
                    <div className="sci-metric-sub">Standard Normal</div>
                  </div>

                  <div className="sci-metric-card">
                    <span className="sci-metric-label">Critical Value (z_crit)</span>
                    <div className="sci-metric-value text-slate-200">{propTestResult.test_details.critical_value}</div>
                    <div className="sci-metric-sub">at α = {propAlpha}</div>
                  </div>

                  <div className="sci-metric-card">
                    <span className="sci-metric-label">p-Value</span>
                    <div className={`sci-metric-value ${propTestResult.test_details.p_value <= propAlpha ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {propTestResult.test_details.p_value}
                    </div>
                    <div className="sci-metric-sub">
                      {propTestResult.test_details.p_value <= propAlpha ? '≤ α — Significant' : '> α — Not Significant'}
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
                    <p className="text-sm text-slate-200 leading-relaxed">{propTestResult.interpretation}</p>
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
                    ? `The observed rainy-day proportion of ${(propTestResult.sample_proportion_p_hat * 100).toFixed(1)}% differs significantly from the reference p₀ = ${(propTestResult.reference_proportion_p0 * 100).toFixed(1)}% at the ${(propAlpha * 100).toFixed(0)}% significance level. The Z-statistic of ${propTestResult.test_details.test_statistic_z} exceeded the critical value in the rejection region. Statistical evidence supports the claim that the true proportion differs from the baseline.`
                    : `We do NOT have sufficient evidence to conclude that the rainy-day proportion differs from p₀ = ${(propTestResult.reference_proportion_p0 * 100).toFixed(1)}%. The observed proportion of ${(propTestResult.sample_proportion_p_hat * 100).toFixed(1)}% is statistically consistent with the reference. Important: this does NOT prove the proportions are equal — we simply cannot reject H₀ at the α = ${propAlpha} level.`
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
                Decision Errors in Proportion Testing
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40">
                <div className="text-rose-400 font-bold text-sm mb-1.5">Type I Error (α — False Positive)</div>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  Concluding the rainy-day proportion differs from p₀ when it actually doesn't. If α = 0.05, we accept a 5% chance of this error. Controlled directly by the significance level.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                <div className="text-amber-400 font-bold text-sm mb-1.5">Type II Error (β — False Negative)</div>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  Failing to detect a real difference in rainy-day frequency from the reference. Test power (1 − β) depends on sample size, true effect size, and chosen α. Larger samples increase power.
                </p>
              </div>
            </div>
            <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <strong className="text-amber-400">Viva Rule:</strong> The Z-test for proportions requires n·p₀ ≥ 5 and n·(1−p₀) ≥ 5 for the normal approximation to be valid. Always verify sample size adequacy.
            </div>
          </section>

          {/* ── Formula Card ── */}
          <FormulaCard
            title="Module VIII — One-Sample Proportion Z-Test Formula"
            formula="z = (p̂ − p₀) / √[p₀(1 − p₀) / n]     p-value = P(Z ≥ |z_calc| | H₀)"
            variables={[
              { symbol: 'z', meaning: 'Standard normal test statistic for one-sample proportion test' },
              { symbol: 'p̂', meaning: 'Observed sample proportion of rainy days (days ≥ threshold / total days)' },
              { symbol: 'p₀', meaning: 'Null hypothesis reference proportion (climatological baseline)' },
              { symbol: 'n', meaning: 'Total number of days in the sample' },
              { symbol: 'p-value', meaning: 'Probability of observing |z| this extreme or greater under H₀' },
            ]}
            explanation="The one-sample Z-test for proportions determines whether the observed rainy-day frequency is statistically compatible with a reference proportion p₀. The standard error under H₀ uses p₀ (not p̂) as prescribed by the null hypothesis."
            academicNote="The normal approximation is valid when both np₀ ≥ 5 and n(1−p₀) ≥ 5. For very small proportions or small samples, use the exact binomial test. The Z-test and χ² goodness-of-fit test give equivalent results for proportions."
          />
        </>
      )}
    </div>
  );
};
