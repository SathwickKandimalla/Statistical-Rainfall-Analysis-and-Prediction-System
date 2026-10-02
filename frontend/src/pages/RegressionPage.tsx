import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  LineChart as LineIcon,
  Target,
  ArrowDown,
  CloudRain,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { RegressionResponse, ModelComparisonResponse, PredictionResponse, LocationItem } from '../types';
import { fetchRegression, fetchModelComparison, fetchPrediction } from '../services/api';
import { FormulaCard } from '../components/FormulaCard';

interface RegressionPageProps {
  datasetKey: string;
  location: LocationItem;
}

export const RegressionPage: React.FC<RegressionPageProps> = ({ datasetKey, location }) => {
  const [modelType, setModelType] = useState<string>('multiple');
  const [polyDegree, setPolyDegree] = useState<number>(2);

  const [regressionData, setRegressionData] = useState<RegressionResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<ModelComparisonResponse | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [regRes, compRes, predRes] = await Promise.all([
        fetchRegression({
          dataset_key: datasetKey,
          model_type: modelType,
          target_variable: 'rain_sum',
          train_split: 0.8,
          poly_degree: polyDegree,
        }),
        fetchModelComparison({
          dataset_key: datasetKey,
          target_variable: 'rain_sum',
          train_split: 0.8,
        }),
        fetchPrediction({
          dataset_key: datasetKey,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          model_type: modelType,
          poly_degree: polyDegree,
        }),
      ]);

      setRegressionData(regRes);
      setComparisonData(compRes);
      setPredictionData(predRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [datasetKey, location, modelType, polyDegree]);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">

      {/* ── Page Header ── */}
      <div className="sci-page-header">
        <div className="sci-module-badge" style={{ '--badge-color': '#10b981' } as React.CSSProperties}>
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Module X • Regression & Prediction</span>
        </div>
        <h1 className="sci-page-title">
          Statistical Rainfall Regression &amp; Model-Based Prediction
        </h1>
        <p className="sci-page-subtitle">
          Rigorous chronological hold-out validation, multicollinearity diagnostics, residual analysis, and
          model-based rainfall estimation using real-time forecast atmospheric inputs.
        </p>

        {/* Pipeline flow */}
        <div className="sci-flow mt-4">
          <span className="sci-flow-step">Historical Data</span>
          <span className="sci-flow-arrow">→</span>
          <span className="sci-flow-step">Atmospheric Predictors</span>
          <span className="sci-flow-arrow">→</span>
          <span className="sci-flow-step">Regression Model</span>
          <span className="sci-flow-arrow">→</span>
          <span className="sci-flow-step">Predicted Rainfall</span>
          <span className="sci-flow-arrow">→</span>
          <span className="sci-flow-step">95% Prediction Interval</span>
        </div>

        {/* Model selector */}
        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-6 text-xs" style={{ borderColor: '#1a2540' }}>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Regression Architecture:</span>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="sci-select"
              style={{ width: 'auto', minWidth: '14rem' }}
            >
              <option value="multiple">Multiple Linear Regression (Atmospheric Predictors)</option>
              <option value="simple">Simple Linear Regression (Humidity Only)</option>
              <option value="polynomial">Polynomial Regression (Degree 2 Curvature)</option>
            </select>
          </div>
          <div className="text-slate-400 font-mono">
            Split: <strong className="text-emerald-400">80% Train</strong> / <strong className="text-sky-400">20% Hold-out Test</strong>
          </div>
        </div>
      </div>

      {loading || !regressionData || !comparisonData ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono">Fitting regression model...</span>
        </div>
      ) : (
        <>
          {/* ════════════════════════════════════════════
              SECTION A: REGRESSION ANALYSIS
          ════════════════════════════════════════════ */}
          <div className="space-y-6">
            <div className="sci-section-divider">
              <div className="sci-section-divider-line" />
              <div className="sci-section-divider-label flex items-center gap-1.5">
                <BarChart3 className="w-3 h-3" />
                Section A — Regression Analysis
              </div>
              <div className="sci-section-divider-line" />
            </div>

            {/* Model Coefficients */}
            <div className="sci-section">
              <div className="sci-section-header">
                <h2 className="sci-section-title">Fitted Regression Parameter Coefficients</h2>
                <p className="sci-section-desc">
                  Estimated β coefficients and VIF multicollinearity diagnostics for each predictor feature.
                </p>
              </div>
              <div className="overflow-x-auto border rounded-xl" style={{ borderColor: '#1a2540' }}>
                <table className="sci-table">
                  <thead>
                    <tr>
                      <th>Predictor Feature</th>
                      <th>Coefficient (β_j)</th>
                      <th>VIF (Multicollinearity)</th>
                      <th>Physical Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-white font-bold">Intercept (β₀)</td>
                      <td className="text-emerald-300 font-bold font-mono">{regressionData.model_parameters.intercept}</td>
                      <td className="text-slate-500">—</td>
                      <td className="text-slate-400 text-[11px]">Baseline estimated rainfall when all predictors are zero</td>
                    </tr>
                    {regressionData.model_parameters.coefficients.map((coef, idx) => (
                      <tr key={idx}>
                        <td className="text-white">{coef.feature}</td>
                        <td className="text-emerald-300 font-bold font-mono">{coef.coefficient}</td>
                        <td>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold font-mono"
                            style={{
                              background: (regressionData.vif_multicollinearity[coef.feature] || 1.0) > 5.0
                                ? 'rgba(245,158,11,0.1)' : '#0f1a2e',
                              color: (regressionData.vif_multicollinearity[coef.feature] || 1.0) > 5.0
                                ? '#fbbf24' : '#64748b',
                            }}
                          >
                            {regressionData.vif_multicollinearity[coef.feature] ?? '1.0'}
                          </span>
                        </td>
                        <td className="text-slate-400 text-[11px]">{coef.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assumption Diagnostics */}
            <div className="sci-section" style={{ borderLeftColor: '#22d3ee' }}>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h2 className="sci-section-title">Model Assumption Diagnostics &amp; Physical Constraints</h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{regressionData.physical_constraint_note}</p>
              {regressionData.assumption_warnings.length > 0 && (
                <div className="mt-3 flex items-start gap-2 text-amber-400 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regressionData.assumption_warnings.join(' | ')}</span>
                </div>
              )}
            </div>

            {/* Actual vs Predicted Chart */}
            <div className="sci-chart-container">
              <div className="flex items-center gap-2 mb-1">
                <LineIcon className="w-4 h-4 text-emerald-400" />
                <h2 className="sci-chart-title">Validation Set: Actual Recorded Rainfall vs. Model Estimated Rainfall</h2>
              </div>
              <p className="sci-chart-subtitle">
                Chronological hold-out test period beginning {regressionData.train_test_split_date}
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={regressionData.holdout_time_series} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                    <XAxis dataKey="date" stroke="#3b4f6b" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis stroke="#3b4f6b" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#253045', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="actual" stroke="#22d3ee" strokeWidth={2} name="Actual Rainfall (mm)" dot={false} />
                    <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 3" name="Model Predicted (mm)" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Residual Plots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="sci-chart-container">
                <h2 className="sci-chart-title">Residuals vs. Fitted Values</h2>
                <p className="sci-chart-subtitle">
                  Checking homoscedasticity and non-linear patterns — eᵢ = yᵢ − ŷᵢ
                </p>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                      <XAxis dataKey="predicted" stroke="#3b4f6b" tick={{ fontSize: 10, fill: '#64748b' }}
                        label={{ value: 'Fitted ŷ (mm)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                      <YAxis dataKey="residual" stroke="#3b4f6b" tick={{ fontSize: 11, fill: '#64748b' }}
                        label={{ value: 'Residual e', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#253045', borderRadius: '8px', fontSize: '12px' }} />
                      <Scatter data={regressionData.residual_diagnostics.residuals_vs_predicted} fill="#38bdf8" opacity={0.65} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="sci-chart-container">
                <h2 className="sci-chart-title">Residual Error Distribution</h2>
                <p className="sci-chart-subtitle">
                  Mean residual = {regressionData.residual_diagnostics.mean_residual} mm · Std = {regressionData.residual_diagnostics.std_residual} mm
                </p>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regressionData.residual_diagnostics.histogram} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                      <XAxis dataKey="midpoint" stroke="#3b4f6b" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis stroke="#3b4f6b" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#253045', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="frequency" fill="#a855f7" radius={[4, 4, 0, 0]} name="Residual Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              SECTION B: MODEL EVALUATION
          ════════════════════════════════════════════ */}
          <div className="space-y-6">
            <div className="sci-section-divider">
              <div className="sci-section-divider-line" />
              <div className="sci-section-divider-label flex items-center gap-1.5">
                <Cpu className="w-3 h-3" />
                Section B — Model Evaluation
              </div>
              <div className="sci-section-divider-line" />
            </div>

            {/* Key Validation Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="sci-metric-card">
                <span className="sci-metric-label">Hold-out RMSE</span>
                <div className="sci-metric-value text-emerald-400">{regressionData.validation_metrics.rmse_mm}</div>
                <div className="sci-metric-sub">mm · Train: {regressionData.train_metrics.rmse_mm}</div>
              </div>
              <div className="sci-metric-card">
                <span className="sci-metric-label">Hold-out MAE</span>
                <div className="sci-metric-value text-cyan-400">{regressionData.validation_metrics.mae_mm}</div>
                <div className="sci-metric-sub">mm · Train: {regressionData.train_metrics.mae_mm}</div>
              </div>
              <div className="sci-metric-card">
                <span className="sci-metric-label">Hold-out R²</span>
                <div className="sci-metric-value text-sky-400">{regressionData.validation_metrics.r2}</div>
                <div className="sci-metric-sub">Adj R² = {regressionData.validation_metrics.adj_r2}</div>
              </div>
              <div className="sci-metric-card">
                <span className="sci-metric-label">Chronological Split</span>
                <div className="sci-metric-value text-white" style={{ fontSize: '1rem', paddingTop: '0.25rem' }}>
                  {regressionData.train_test_split_date}
                </div>
                <div className="sci-metric-sub text-emerald-400">Zero data leakage</div>
              </div>
            </div>

            {/* R² Explanation */}
            <div className="sci-info-panel">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                  Academic Interpretation of Hold-out R² ({regressionData.validation_metrics.r2})
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {regressionData.validation_metrics.r2_academic_explanation || (
                  regressionData.validation_metrics.r2 < 0
                    ? "A negative R² on the chronological holdout set means the regression model performs worse than a simple baseline predicting the test-set mean. This indicates the selected linear predictors do not adequately explain unseen rainfall variation. This is a genuine validation result, not a software error."
                    : "R² measures the proportion of variance in unseen rainfall observations explained by the regression model relative to predicting the test-set mean."
                )}
              </p>
            </div>

            {/* Model Comparison Table */}
            <div className="sci-section">
              <div className="sci-section-header border-b pb-4 mb-5" style={{ borderColor: '#1a2540' }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="sci-section-title">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      Model Architecture Comparison
                    </h2>
                    <p className="sci-section-desc">
                      Evaluated strictly on unseen chronological test observations (N = {regressionData.test_observations} days)
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full font-semibold border"
                    style={{ background: 'rgba(16,185,129,0.08)', color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}>
                    Recommended: {comparisonData.recommended_model}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-xl" style={{ borderColor: '#1a2540' }}>
                <table className="sci-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Predictor Features</th>
                      <th>Validation MAE (mm)</th>
                      <th>Validation RMSE (mm)</th>
                      <th>Hold-out R²</th>
                      <th>Interpretability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.comparison_table.map((m) => (
                      <tr key={m.model_id}
                        style={m.name.toLowerCase().includes(modelType)
                          ? { background: 'rgba(16,185,129,0.04)' } : {}}>
                        <td className="text-white font-bold">{m.name}</td>
                        <td className="text-slate-400">{m.predictors}</td>
                        <td className="text-cyan-300 font-bold font-mono">{m.validation_mae}</td>
                        <td className="text-emerald-400 font-bold font-mono">{m.validation_rmse}</td>
                        <td className="text-sky-400 font-mono">{m.validation_r2}</td>
                        <td className="text-slate-300 text-[11px]">{m.interpretability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed"
                style={{ background: '#08111e', border: '1px solid #1a2540' }}>
                <strong className="text-emerald-400">Scientific Rationale: </strong>
                {comparisonData.recommendation_rationale}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════
              SECTION C: RAINFALL PREDICTION
          ════════════════════════════════════════════ */}
          {predictionData && (
            <div className="space-y-6">
              <div className="sci-section-divider">
                <div className="sci-section-divider-line" />
                <div className="sci-section-divider-label flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-emerald-400" />
                  <span style={{ color: '#34d399' }}>Section C — Rainfall Prediction</span>
                </div>
                <div className="sci-section-divider-line" />
              </div>

              {/* Prediction Panel Header */}
              <div className="sci-prediction-panel">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 mb-5"
                  style={{ borderBottom: '1px solid rgba(16,185,129,0.2)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Model-Based Rainfall Prediction</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Short-Term Rainfall Estimates
                    </h2>
                    <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                      Real-time forecast atmospheric inputs (temperature, humidity, pressure, wind speed) are fed into
                      the trained statistical regression model to generate daily rainfall estimates with 95% prediction intervals.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl text-right text-xs shrink-0"
                    style={{ background: '#0a1e1a', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-[10px] font-bold tracking-wider text-amber-400 block uppercase">
                      {predictionData.transparency_notice.source_designation}
                    </span>
                    <span className="text-slate-500 text-[10px]">Not an official meteorological forecast</span>
                  </div>
                </div>

                {/* Statistical prediction flow within the panel */}
                <div className="flex flex-wrap items-center gap-2 mb-5 text-[11px] text-slate-500">
                  <span className="px-2 py-1 rounded text-emerald-400 font-semibold"
                    style={{ background: 'rgba(16,185,129,0.1)' }}>Historical Weather Data</span>
                  <ArrowDown className="w-3 h-3 rotate-[-90deg] text-slate-600" />
                  <span className="px-2 py-1 rounded text-slate-300"
                    style={{ background: '#0f1f1a' }}>Statistical Predictors</span>
                  <ArrowDown className="w-3 h-3 rotate-[-90deg] text-slate-600" />
                  <span className="px-2 py-1 rounded text-slate-300"
                    style={{ background: '#0f1f1a' }}>Regression Model</span>
                  <ArrowDown className="w-3 h-3 rotate-[-90deg] text-slate-600" />
                  <span className="px-2 py-1 rounded font-bold text-emerald-300"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    Predicted Rainfall
                  </span>
                  <ArrowDown className="w-3 h-3 rotate-[-90deg] text-slate-600" />
                  <span className="px-2 py-1 rounded text-slate-300"
                    style={{ background: '#0f1f1a' }}>95% Prediction Interval</span>
                </div>

                {/* Prominent first-day prediction highlight */}
                {predictionData.daily_estimates.length > 0 && (
                  <div className="p-5 rounded-xl mb-5"
                    style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">
                      Next-Day Model Estimate — {predictionData.daily_estimates[0].date}
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <div className="sci-prediction-value">
                          {predictionData.daily_estimates[0].model_rainfall_estimate_mm.toFixed(1)}
                          <span className="sci-prediction-unit">mm</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          95% PI: [{predictionData.daily_estimates[0].prediction_interval_95.lower_bound_mm.toFixed(1)} –{' '}
                          {predictionData.daily_estimates[0].prediction_interval_95.upper_bound_mm.toFixed(1)}] mm
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 max-w-xs leading-relaxed border-l pl-4"
                        style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                        <span className="text-amber-400 font-semibold block mb-1">⚠ Statistical Disclaimer</span>
                        This is a statistical model estimate, not an official weather forecast.
                        Actual rainfall may differ significantly from this estimate.
                      </div>
                    </div>
                  </div>
                )}

                {/* Full daily predictions table */}
                <div className="overflow-x-auto border rounded-xl" style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                  <table className="sci-table">
                    <thead>
                      <tr>
                        <th>Forecast Date</th>
                        <th>Temp (°C)</th>
                        <th>Humidity (%)</th>
                        <th>Pressure (hPa)</th>
                        <th>Wind (km/h)</th>
                        <th style={{ color: '#34d399' }}>Model Estimate</th>
                        <th style={{ color: '#7dd3fc' }}>95% Prediction Interval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionData.daily_estimates.map((est, idx) => (
                        <tr key={idx}>
                          <td className="text-white font-bold">{est.date}</td>
                          <td className="text-slate-300">{est.input_predictors.temperature_2m_mean ?? '—'}</td>
                          <td className="text-slate-300">{est.input_predictors.relative_humidity_2m_mean ?? '—'}</td>
                          <td className="text-slate-400">{est.input_predictors.pressure_msl_mean ?? '—'}</td>
                          <td className="text-slate-400">{est.input_predictors.wind_speed_10m_max ?? '—'}</td>
                          <td>
                            <span className="px-2 py-1 rounded font-bold font-mono text-sm"
                              style={{
                                background: est.model_rainfall_estimate_mm >= 15.0
                                  ? 'rgba(16,185,129,0.15)' : est.model_rainfall_estimate_mm > 0
                                  ? 'rgba(16,185,129,0.07)' : 'transparent',
                                color: est.model_rainfall_estimate_mm >= 15.0 ? '#34d399' :
                                       est.model_rainfall_estimate_mm > 0 ? '#6ee7b7' : '#64748b',
                                border: est.model_rainfall_estimate_mm >= 15.0
                                  ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                              }}>
                              {est.model_rainfall_estimate_mm.toFixed(1)} mm
                            </span>
                          </td>
                          <td className="text-sky-400 font-semibold font-mono">
                            [{est.prediction_interval_95.lower_bound_mm.toFixed(1)} –{' '}
                            {est.prediction_interval_95.upper_bound_mm.toFixed(1)}] mm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Transparency note */}
                <div className="mt-5 p-4 rounded-xl text-xs space-y-2 text-slate-300"
                  style={{ background: '#07130f', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="font-semibold text-emerald-400">Atmospheric Data Flow Transparency</div>
                  <p className="leading-relaxed text-[11px] text-slate-300">{predictionData.transparency_notice.clarification}</p>
                  <p className="text-[11px] text-slate-400 italic">{predictionData.transparency_notice.prediction_interval_meaning}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Formula Card ── */}
          <FormulaCard
            title="Module X — Regression & Prediction Formulas"
            formula="ŷ = β₀ + ∑ β_j x_j + ε  ·  R² = 1 − (SS_res / SS_tot)  ·  PI: ŷ₀ ± t_(α/2) · sₑ √(1 + 1/n + ...)"
            variables={[
              { symbol: 'β_j', meaning: 'Partial regression coefficients: change in ŷ per unit change in x_j' },
              { symbol: 'R²', meaning: 'Coefficient of determination — proportion of variance explained on hold-out set' },
              { symbol: 'sₑ', meaning: 'Standard error of the regression estimate' },
              { symbol: 'VIF', meaning: 'Variance Inflation Factor: VIF > 5 indicates moderate to high multicollinearity' },
            ]}
            explanation="Multiple linear regression estimates the conditional expectation of rainfall given observed atmospheric variables. Chronological hold-out guarantees future observations never contaminate historical model training."
            academicNote="Viva tip: Why must chronological splits be used instead of random k-fold cross-validation for time-series weather data? Random shuffling causes data leakage from future days into past training sets — violating temporal causality."
          />
        </>
      )}
    </div>
  );
};
