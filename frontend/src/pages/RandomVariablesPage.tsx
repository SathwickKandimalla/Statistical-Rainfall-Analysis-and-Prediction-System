import React, { useState, useEffect } from 'react';
import { Dice5, Activity, Layers, TrendingUp } from 'lucide-react';
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
import type { RandomVariablesResponse } from '../types';
import { fetchRandomVariablesAnalysis } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface RandomVariablesPageProps {
  datasetKey: string;
}

export const RandomVariablesPage: React.FC<RandomVariablesPageProps> = ({ datasetKey }) => {
  const [rvData, setRvData] = useState<RandomVariablesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchRandomVariablesAnalysis({ dataset_key: datasetKey });
      setRvData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [datasetKey]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Dice5 className="w-4 h-4" />
          <span>Module III • Random Variables & Distributions</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Discrete vs. Continuous Meteorological Random Variables
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Distinguishing continuous precipitation depth from discrete rainfall event counts and intensity classes,
          evaluating mathematical expectation E[X], variance Var(X), PMF, and empirical CDF.
        </p>
      </div>

      {loading || !rvData ? (
        <div className="py-12 flex justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Continuous Variable Section */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Continuous Domain: X ∈ [0, ∞)
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Continuous Random Variable: Daily Rainfall Amount (X)
                </h3>
              </div>
              <div className="flex items-center space-x-4 font-mono text-xs">
                <span className="text-slate-400">Expected Value E[X] = <strong className="text-white">{rvData.continuous_variable.expected_value_E_X} mm</strong></span>
                <span className="text-slate-400">Var(X) = <strong className="text-cyan-400">{rvData.continuous_variable.variance_Var_X}</strong></span>
                <span className="text-slate-400">SD(X) = <strong className="text-white">{rvData.continuous_variable.std_deviation_SD_X} mm</strong></span>
              </div>
            </div>

            {/* Empirical Cumulative Distribution Function (ECDF) Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">
                Empirical Cumulative Distribution Function: F_n(x) = P(X ≤ x)
              </h4>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rvData.continuous_variable.ecdf} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="x_mm" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Rainfall x (mm)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 1]} label={{ value: 'F(x)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${val}`, 'Cumulative Probability F(x)']}
                    />
                    <Line type="stepAfter" dataKey="ecdf" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="ECDF F(x)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                {rvData.continuous_variable.interpretation}
              </p>
            </div>
          </div>

          {/* Discrete Variable Section */}
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                  Discrete Domain: Y ∈ &#123;0, 1, 2, 3, 4&#125;
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Discrete Random Variable: Rainfall Intensity Class (Y)
                </h3>
              </div>
              <div className="flex items-center space-x-4 font-mono text-xs">
                <span className="text-slate-400">E[Y] = <strong className="text-white">{rvData.discrete_categorical_variable.expected_value_E_Y}</strong></span>
                <span className="text-slate-400">Var(Y) = <strong className="text-sky-400">{rvData.discrete_categorical_variable.variance_Var_Y}</strong></span>
                <span className="text-slate-400">SD(Y) = <strong className="text-white">{rvData.discrete_categorical_variable.std_deviation_SD_Y}</strong></span>
              </div>
            </div>

            {/* PMF Chart */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">
                Probability Mass Function: P(Y = y_k)
              </h4>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rvData.discrete_categorical_variable.pmf} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, 'Probability P(Y=y)']}
                    />
                    <Bar dataKey="probability_pmf" fill="#38bdf8" radius={[4, 4, 0, 0]} name="PMF Probability" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Discrete PMF Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-xl mt-3 font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Category Name</th>
                    <th className="px-4 py-2.5">Code (y_i)</th>
                    <th className="px-4 py-2.5">Observed Count</th>
                    <th className="px-4 py-2.5">PMF: P(Y = y_i)</th>
                    <th className="px-4 py-2.5">CDF: P(Y ≤ y_i)</th>
                    <th className="px-4 py-2.5">y_i · P(Y = y_i)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rvData.discrete_categorical_variable.pmf.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2 text-white font-semibold font-sans">{cat.category}</td>
                      <td className="px-4 py-2 text-slate-300">{cat.code}</td>
                      <td className="px-4 py-2 text-slate-400">{cat.count}</td>
                      <td className="px-4 py-2 text-cyan-300 font-bold">{cat.probability_pmf}</td>
                      <td className="px-4 py-2 text-sky-400">{cat.cumulative_prob_cdf}</td>
                      <td className="px-4 py-2 text-emerald-400">{(cat.code * cat.probability_pmf).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Formula Card */}
          <FormulaCard
            title="Module III Core Random Variable Formulas"
            formula="E[X] = ∑ x_i · P(X = x_i)  |  Var(X) = E[X²] - (E[X])²  |  F(x) = P(X ≤ x)"
            variables={[
              { symbol: 'E[X]', meaning: 'Mathematical expectation / long-term theoretical mean' },
              { symbol: 'Var(X)', meaning: 'Variance representing expected squared deviation about the mean' },
              { symbol: 'F(x)', meaning: 'Cumulative distribution function (non-decreasing from 0 to 1)' },
              { symbol: 'PMF', meaning: 'Probability mass function for discrete variables where ∑ P(X=x_i) = 1' },
            ]}
            explanation="Random variables map real-world experimental outcomes to numerical values. For continuous variables like rainfall depth, the probability at any exact single point is mathematically zero (P(X = x) = 0), necessitating interval integration via density functions f(x)."
            academicNote="In viva examinations, explain why E[aX + b] = aE[X] + b (linearity of expectation) and Var(aX + b) = a²Var(X)."
          />
        </>
      )}
    </div>
  );
};
