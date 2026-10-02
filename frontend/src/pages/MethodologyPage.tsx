import React from 'react';
import { BookOpen, CheckCircle2, ArrowDown, Layers, Activity, Cpu } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Geographic Geocoding & Historical Data Ingestion',
      concept: 'Open-Meteo Geocoding & Historical Weather API',
      purpose: 'Dynamically resolve city coordinates and fetch daily meteorological reanalysis time-series without hardcoded assumptions.',
      formula: 'X = {x_t}_(t=1)^N  where  x_t ∈ ℝ^k',
      rainfallUse: 'Retrieves rain_sum (mm), precipitation_sum, mean/max/min temperatures, relative humidity, atmospheric pressure, and wind speed.',
    },
    {
      step: '02',
      title: 'Data Cleaning & Verification Pipeline',
      concept: 'Data Quality Auditing & Linear Imputation',
      purpose: 'Ensure chronological order, eliminate duplicate timestamps, verify continuous daily sequences, and enforce non-negativity.',
      formula: 'x_t = max(0, x_t)  ∀ t ∈ {1, ..., N}',
      rainfallUse: 'Physical rainfall constraints dictate rain_sum ≥ 0.0 mm. Small missing gaps are interpolated; larger gaps are reported transparently.',
    },
    {
      step: '03',
      title: 'Descriptive Statistics & Exploratory Data Analysis (Module I)',
      concept: 'Central Tendency, Dispersion, Ogives & Chebyshev’s Inequality',
      purpose: 'Quantify baseline precipitation characteristics and universal dispersion bounds.',
      formula: 'x̄ = (1/n) ∑ x_i  |  s = √[(1/(n-1)) ∑ (x_i - x̄)²]  |  P(|X - μ| < kσ) ≥ 1 - 1/k²',
      rainfallUse: 'Calculates mean daily rainfall, variance, standard deviation, and verifies Chebyshev bounds without assuming normality.',
    },
    {
      step: '04',
      title: 'Probability Calculus & Event Updating (Module II)',
      concept: 'Axioms of Probability, Conditional Probability & Bayes’ Theorem',
      purpose: 'Model precipitation occurrence probabilities and incorporate atmospheric evidence.',
      formula: 'P(A | B) = [P(B | A) · P(A)] / P(B)  |  P(A ∪ B) = P(A) + P(B) - P(A ∩ B)',
      rainfallUse: 'Derives the probability of rain given high relative humidity P(Rain | High Hum) and tests event independence.',
    },
    {
      step: '05',
      title: 'Random Variables & Expectation (Module III)',
      concept: 'Discrete vs. Continuous Random Variables & Empirical CDF',
      purpose: 'Distinguish continuous rainfall depth from discrete storm occurrence classes.',
      formula: 'E[X] = ∫ x f(x) dx  |  E[Y] = ∑ y_i P(Y = y_i)  |  F_n(x) = (1/n) ∑ 𝕀(x_i ≤ x)',
      rainfallUse: 'Continuous precipitation amount treated as X ∈ [0, ∞); rainfall intensity classification treated as discrete Y ∈ {0,1,2,3,4}.',
    },
    {
      step: '06',
      title: 'Discrete Probability Distributions (Module IV)',
      concept: 'Binomial, Poisson, and Law of Rare Events',
      purpose: 'Model count of rainy days in n trials and frequency of extreme storm events.',
      formula: 'Binomial: P(X=k) = (nCk) p^k (1-p)^(n-k)  |  Poisson: P(Y=k) = (e^(-λ) λ^k) / k!',
      rainfallUse: 'Number of rainy days in 14-day intervals modeled via Binomial(n, p); rare heavy rain storms (≥ 15 mm) modeled via Poisson(λ).',
    },
    {
      step: '07',
      title: 'Continuous Theoretical Distributions (Module V)',
      concept: 'Normal, Gamma, Exponential, Uniform & Beta MLE Fitting',
      purpose: 'Fit parametric continuous probability density functions to hydrological records with Kolmogorov-Smirnov fit diagnostics.',
      formula: 'Gamma: f(x) = [1 / (Γ(α)β^α)] x^(α-1) e^(-x/β)  |  KS: D = sup |F_n(x) - F(x)|',
      rainfallUse: 'Gamma distribution fitted to non-zero rainfall depths; Normal distribution fitted to symmetric variables (temperature).',
    },
    {
      step: '08',
      title: 'Sampling Theory & Central Limit Theorem (Module VI)',
      concept: 'CLT Simulation, Point Estimation & Student’s t / Chi² Confidence Intervals',
      purpose: 'Demonstrate asymptotic normality of sample means and establish interval estimates.',
      formula: 'SE = σ / √n  |  CI_mean: x̄ ± t_(α/2, n-1) · (s / √n)  |  F = s₁² / s₂²',
      rainfallUse: 'Repeated sampling of size n shows sample means converge to Normal even when raw rainfall is heavily right-skewed.',
    },
    {
      step: '09',
      title: 'Hypothesis Testing for Means & Proportions (Modules VII & VIII)',
      concept: 'One-Sample t-Test & One-Sample Z-Test for Proportions',
      purpose: 'Statistically evaluate whether local weather significantly differs from historical reference baselines.',
      formula: 't = (x̄ - μ₀) / (s / √n)  |  z = (p̂ - p₀) / √[p₀(1 - p₀) / n]',
      rainfallUse: 'Tests H₀: μ = μ₀ (baseline rainfall mean) and H₀: p = p₀ (rainy day proportion) at significance level α.',
    },
    {
      step: '10',
      title: 'Correlation & Multicollinearity Analysis (Module IX)',
      concept: 'Pearson r, Spearman Rank ρ, Covariance Matrix & VIF',
      purpose: 'Determine strength and direction of association between weather variables without confusing correlation with causation.',
      formula: 'r = Cov(X,Y) / (s_X s_Y)  |  ρ = 1 - [6 ∑ d_i² / (n(n² - 1))]  |  VIF_j = 1 / (1 - R_j²)',
      rainfallUse: 'Evaluates linear and monotonic association between humidity, pressure, temperature, wind speed, and rain depth.',
    },
    {
      step: '11',
      title: 'Regression Modeling & Hold-out Evaluation (Module X)',
      concept: 'Multiple Linear Regression with Chronological 80/20 Train/Test Split',
      purpose: 'Train predictive relationships without data leakage, evaluating MAE, RMSE, and R² on unseen hold-out data.',
      formula: 'ŷ = β₀ + β₁x₁ + ... + β_k x_k  |  RMSE = √[(1/n) ∑ (y_i - ŷ_i)²]',
      rainfallUse: 'Predicts daily rainfall from atmospheric inputs; negative raw predictions clamped to 0.0 mm according to physical constraints.',
    },
    {
      step: '12',
      title: 'Model-Based Prediction with Open-Meteo Forecast Inputs',
      concept: 'Short-Term Prediction & Approximate 95% Prediction Intervals',
      purpose: 'Feed future forecast atmospheric variables into our trained statistical model to generate honest, interval-bounded estimates.',
      formula: 'PI_95% = ŷ₀ ± 1.96 · s_e  where  s_e = √[SSE / (n - p - 1)]',
      rainfallUse: 'Generates day-by-day model rainfall estimates bounded by 95% prediction intervals, clearly labeled as a model-based estimate.',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Academic Methodology & Workflow Architecture</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Statistical Architecture & Mathematical Roadmap
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Comprehensive stage-by-stage explanation of mathematical concepts, formulas, and real-world meteorological applications.
        </p>
      </div>

      {/* Step by step cards */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div key={s.step} className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-bold flex items-center justify-center text-sm">
                  {s.step}
                </span>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-400">
                {s.concept}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold block">Academic Purpose:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{s.purpose}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1 font-mono">
                <span className="text-slate-400 font-semibold block font-sans">Key Mathematical Formula:</span>
                <p className="text-cyan-300 text-xs mt-1">{s.formula}</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 font-semibold block">Meteorological Application:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">{s.rainfallUse}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
