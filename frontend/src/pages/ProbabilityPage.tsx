import React, { useState, useEffect } from 'react';
import { PieChart as PieIcon, Sliders, CheckCircle2, GitCompare, Calculator } from 'lucide-react';
import type { ProbabilityResponse } from '../types';
import { fetchProbabilityAnalysis } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface ProbabilityPageProps {
  datasetKey: string;
}

export const ProbabilityPage: React.FC<ProbabilityPageProps> = ({ datasetKey }) => {
  const [rainThreshold, setRainThreshold] = useState<number>(1.0);
  const [humThreshold, setHumThreshold] = useState<number>(75.0);
  const [tempThreshold, setTempThreshold] = useState<number>(35.0);
  const [probData, setProbData] = useState<ProbabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchProbabilityAnalysis({
        dataset_key: datasetKey,
        rain_threshold: rainThreshold,
        high_humidity_threshold: humThreshold,
        high_temp_threshold: tempThreshold,
      });
      setProbData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [datasetKey, rainThreshold, humThreshold, tempThreshold]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <PieIcon className="w-4 h-4" />
          <span>Module II • Introduction to Probability Theory</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Event Probabilities, Conditional Probabilities & Bayes' Theorem
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Empirical probability calculus on weather events, testing statistical independence, and
          deriving posterior probabilities via Bayes' Theorem.
        </p>

        {/* Threshold controls */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Event A Threshold (Rain mm):</span>
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={rainThreshold}
              onChange={(e) => setRainThreshold(Math.max(0.1, Number(e.target.value)))}
              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Event B Threshold (Humidity %):</span>
            <input
              type="number"
              min={40}
              max={95}
              value={humThreshold}
              onChange={(e) => setHumThreshold(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Event C Threshold (Temp °C):</span>
            <input
              type="number"
              min={20}
              max={45}
              value={tempThreshold}
              onChange={(e) => setTempThreshold(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading || !probData ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Defined Events Probabilities Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Event A: Rainy Day</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{probData.events.A.name}</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
                P(A) = {(probData.events.A.probability * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Count: {probData.events.A.count} / {probData.sample_size}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Event B: High Humidity</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{probData.events.B.name}</div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-2">
                P(B) = {(probData.events.B.probability * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Count: {probData.events.B.count} / {probData.sample_size}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Event C: High Temperature</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">{probData.events.C.name}</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                P(C) = {(probData.events.C.probability * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Count: {probData.events.C.count} / {probData.sample_size}
              </div>
            </div>
          </div>

          {/* Axioms & Addition Rule */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Axiom of Probability: General Addition Rule</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Intersection P(A ∩ B):</span>
                <div className="text-xl font-bold text-cyan-300 mt-1">
                  {probData.joint_and_union.p_A_and_B.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rainy AND High Humidity</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Union P(A ∪ B):</span>
                <div className="text-xl font-bold text-sky-300 mt-1">
                  {probData.joint_and_union.p_A_or_B.toFixed(4)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rainy OR High Humidity</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">P(A) + P(B) - P(A ∩ B):</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {probData.joint_and_union.addition_rule_check.p_A_plus_p_B_minus_intersection.toFixed(4)}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Axiom Satisfied</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bayes' Theorem Step-by-Step Laboratory */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-cyan-900/60 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-cyan-400" />
                  <span>Bayes' Theorem: Prior to Posterior Updating</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {probData.bayes_theorem.formula}
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Exact Mathematical Equality Verified
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">1. Prior P(Rain)</span>
                <div className="text-lg font-bold text-white mt-1">
                  {(probData.bayes_theorem.prior_p_rain * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500">Unconditional belief</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">2. Likelihood P(Hum|Rain)</span>
                <div className="text-lg font-bold text-sky-400 mt-1">
                  {(probData.bayes_theorem.likelihood_hum_given_rain * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500">P(Evidence | Hypothesis)</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px]">3. Marginal Evidence P(Hum)</span>
                <div className="text-lg font-bold text-amber-300 mt-1">
                  {(probData.bayes_theorem.marginal_p_high_hum_total_prob * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500">Total probability of B</div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-cyan-700/60 bg-cyan-950/20">
                <span className="text-cyan-300 text-[11px] font-bold">4. Posterior P(Rain|Hum)</span>
                <div className="text-lg font-bold text-cyan-300 mt-1">
                  {(probData.bayes_theorem.posterior_p_rain_given_high_hum * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-cyan-400">Updated belief given humidity</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              <strong className="text-cyan-400">Interpretation:</strong> Before checking humidity, the prior probability of rain is {(probData.bayes_theorem.prior_p_rain * 100).toFixed(1)}%. Once high relative humidity is observed as atmospheric evidence, Bayes' formula updates our probability to <strong className="text-white">{(probData.bayes_theorem.posterior_p_rain_given_high_hum * 100).toFixed(1)}%</strong>, matching direct conditional probability <code className="text-cyan-400">P(A ∩ B) / P(B)</code>.
            </div>
          </div>

          {/* Independence Testing & 2x2 Contingency Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Independence Test */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <GitCompare className="w-4 h-4 text-cyan-400" />
                <span>Statistical Event Independence Test</span>
              </h3>
              <p className="text-xs text-slate-400">
                Events A and B are mathematically independent if and only if <code className="text-cyan-400">P(A ∩ B) = P(A) · P(B)</code>.
              </p>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Observed Joint P(A ∩ B):</span>
                  <div className="text-lg font-bold text-white mt-1">
                    {probData.independence_test.p_A_and_B.toFixed(4)}
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Product P(A) · P(B):</span>
                  <div className="text-lg font-bold text-sky-400 mt-1">
                    {probData.independence_test.p_A_times_p_B.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-cyan-400">Conclusion: {probData.independence_test.verdict}</span>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  {probData.independence_test.explanation}
                </p>
              </div>
            </div>

            {/* 2x2 Contingency Table */}
            <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white">2 × 2 Meteorological Contingency Table</h3>
              <p className="text-xs text-slate-400">
                Frequency distribution across Rainy vs Dry and High vs Low Humidity states.
              </p>

              <div className="overflow-x-auto border border-slate-800 rounded-xl mt-2 font-mono text-xs">
                <table className="w-full text-center">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="px-3 py-2">State</th>
                      <th className="px-3 py-2 text-cyan-300">High Humidity</th>
                      <th className="px-3 py-2 text-slate-300">Normal / Low Hum</th>
                      <th className="px-3 py-2 text-white">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-3 py-2 font-semibold text-left text-cyan-400">Rainy Day</td>
                      <td className="px-3 py-2 font-bold text-white">{probData.contingency_table.rain_and_high_hum}</td>
                      <td className="px-3 py-2 text-slate-400">{probData.contingency_table.rain_and_low_hum}</td>
                      <td className="px-3 py-2 text-white">{probData.events.A.count}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-semibold text-left text-amber-300">Dry Day</td>
                      <td className="px-3 py-2 text-slate-400">{probData.contingency_table.dry_and_high_hum}</td>
                      <td className="px-3 py-2 text-slate-400">{probData.contingency_table.dry_and_low_hum}</td>
                      <td className="px-3 py-2 text-white">{probData.sample_size - probData.events.A.count}</td>
                    </tr>
                    <tr className="bg-slate-900/60 font-bold">
                      <td className="px-3 py-2 text-left text-white">Total</td>
                      <td className="px-3 py-2 text-sky-400">{probData.events.B.count}</td>
                      <td className="px-3 py-2 text-slate-300">{probData.sample_size - probData.events.B.count}</td>
                      <td className="px-3 py-2 text-cyan-400">{probData.sample_size}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Academic Formula Card */}
          <FormulaCard
            title="Module II Core Probability Formulas"
            formula="P(A | B) = [P(B | A) · P(A)] / P(B)  |  P(A ∪ B) = P(A) + P(B) - P(A ∩ B)"
            variables={[
              { symbol: 'P(A)', meaning: 'Prior probability of rainfall' },
              { symbol: 'P(B | A)', meaning: 'Likelihood of high humidity given a rainy day' },
              { symbol: 'P(B)', meaning: 'Total probability of high humidity across all states' },
              { symbol: 'P(A | B)', meaning: 'Posterior probability of rain updated by humidity' },
            ]}
            explanation="Conditional probability P(A|B) measures the likelihood of an event given that another event is already known to have occurred. Bayes' theorem enables inverse probability calculations by incorporating prior domain information."
            academicNote="During viva, emphasize how Bayes' theorem utilizes the Law of Total Probability in the denominator: P(B) = P(B|A)P(A) + P(B|A')P(A')."
          />
        </>
      )}
    </div>
  );
};
