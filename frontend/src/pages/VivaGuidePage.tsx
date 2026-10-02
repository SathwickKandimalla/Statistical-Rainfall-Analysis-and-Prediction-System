import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronUp, CheckCircle2, BookOpen, Search } from 'lucide-react';

export const VivaGuidePage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const vivaQuestions = [
    {
      q: '1. Why did you choose rainfall as the domain for this project?',
      a: 'Rainfall is mathematically fascinating because it naturally embodies almost every core concept in Probability Theory and Statistics: it exhibits zero-inflation (many dry days), severe positive right-skewness, non-negativity, temporal autocorrelation, non-Gaussian distributions (such as Gamma and Exponential), and complex multivariable meteorological associations (humidity, temperature, pressure, and wind speed). This makes it an ideal real-world testbed for demonstrating statistical theory beyond trivial synthetic examples.',
    },
    {
      q: '2. Why is this a statistics project rather than a commercial weather website?',
      a: 'A commercial weather website simply displays pre-computed forecasts from external weather APIs. In contrast, this project is a statistical analysis laboratory built directly from scratch: it implements descriptive statistics, empirical probability calculus, Bayes\' Theorem, discrete (Binomial/Poisson) and continuous (Normal/Gamma/Beta) distribution fitting, Central Limit Theorem simulations, Student\'s t and Z hypothesis tests, correlation matrices, and multiple regression models with rigorous chronological hold-out validation. The Open-Meteo API is used strictly as raw observational input data.',
    },
    {
      q: '3. Why use Open-Meteo for retrieving weather data?',
      a: 'Open-Meteo provides open, standardized, and high-resolution historical atmospheric reanalysis (ECMWF ERA5) and forecast data worldwide without requiring proprietary API keys or complex manual CSV downloads. It allows dynamic location geocoding, reproducible scientific analysis for any coordinates globally, and clean feature columns for temperature, humidity, surface pressure, wind speed, and precipitation depth.',
    },
    {
      q: '4. What is the difference between historical reanalysis data and forecast data?',
      a: 'Historical reanalysis (such as ECMWF ERA5) reconstructs past weather by combining physical weather models with historical observations from satellites, weather stations, and radar into a continuous global grid. Forecast data, on the other hand, represents forward numerical simulations running into the future. In our project, historical reanalysis records (2020–present) are used for model training and validation, while future forecast variables (e.g. tomorrow\'s predicted humidity and pressure) serve solely as predictor inputs for our trained regression model.',
    },
    {
      q: '5. Why should we analyze both the mean and the median?',
      a: 'The arithmetic mean (x̄ = Σx / n) represents the center of gravity of the data, but it is heavily pulled upward by rare, extreme storm spikes. The median represents the middle observation (50th percentile) and is robust to extreme values. In daily rainfall data, the mean is consistently much higher than the median (Mean > Median), which mathematically confirms the presence of positive right-skewness.',
    },
    {
      q: '6. Why is daily rainfall positively skewed?',
      a: 'Daily rainfall is heavily right-skewed (skewness g₁ > 1) because the physical lower bound is zero (no negative rain is possible), the majority of days have zero or minimal rainfall (< 1 mm), and only a small percentage of days experience intense downpours (e.g., > 30 mm). This creates a cluster of mass at the lower end and an elongated tail stretching to the right.',
    },
    {
      q: '7. What does the standard deviation tell us about rainfall?',
      a: 'The sample standard deviation s = √[1/(n-1) Σ(x_i - x̄)²] measures how widely daily precipitation values vary around the mean. Combined with the mean, it gives the Coefficient of Variation (CV = s / x̄ × 100%). In rainfall datasets, CV often exceeds 100% to 200%, quantifying the high intermittency and extreme day-to-day variability of weather.',
    },
    {
      q: '8. What is Chebyshev’s inequality, and why is it used instead of the Empirical Rule?',
      a: 'The Empirical (68-95-99.7) Rule strictly requires a symmetric, bell-shaped Normal distribution. In contrast, Chebyshev’s Theorem guarantees that for ANY distribution with finite variance, the proportion of data within k standard deviations of the mean is at least 1 - 1/k² (for any k > 1). For example, for k = 2, at least 1 - 1/4 = 75% of observations must lie in [x̄ - 2s, x̄ + 2s]. Chebyshev provides a guaranteed lower bound without making any distributional assumptions.',
    },
    {
      q: '9. What is conditional probability in the context of weather events?',
      a: 'Conditional probability P(A | B) measures the likelihood that event A occurs given that event B is already known to have occurred: P(A | B) = P(A ∩ B) / P(B). For instance, P(Rain | High Humidity) measures how the probability of rainfall increases when relative humidity exceeds a designated high threshold (e.g., 75%) compared to the unconditional rainy-day probability P(Rain).',
    },
    {
      q: '10. How is Bayes’ Theorem used to update weather beliefs?',
      a: 'Bayes’ Theorem calculates the posterior probability of rain given atmospheric evidence: P(Rain | High Hum) = [P(High Hum | Rain) · P(Rain)] / P(High Hum). Here, P(Rain) is the historical baseline prior probability. Observing high humidity updates this prior belief into a refined posterior probability, with the denominator evaluated via the Law of Total Probability.',
    },
    {
      q: '11. What is a random variable, and how is it used in this project?',
      a: 'A random variable is a mathematical function that maps outcomes of a random experiment to numerical real values. In our project, we demonstrate both continuous and discrete random variables: X = daily precipitation depth in mm (continuous domain [0, ∞) with empirical CDF F(x) = P(X ≤ x)), and Y = rainfall intensity category (discrete categorical variable with codes 0: None, 1: Light, 2: Moderate, 3: Heavy, 4: Violent, evaluated via its PMF).',
    },
    {
      q: '12. Why use the Binomial distribution for rainy days?',
      a: 'The Binomial distribution models the number of successes k in n independent Bernoulli trials with constant probability p: P(X = k) = C(n, k) p^k (1-p)^(n-k). In our project, it models the number of rainy days in an n-day window (e.g., n = 14 days), assuming each day has success probability p = P(Rain ≥ 1 mm). It provides theoretical mean np and variance np(1-p).',
    },
    {
      q: '13. Why check Poisson distribution assumptions?',
      a: 'The Poisson distribution models counts of rare events occurring at a constant average rate λ in fixed time intervals. A fundamental mathematical assumption of Poisson is equidispersion: Mean = Variance = λ. Checking this assumption is critical in academic statistics to verify whether the empirical count data truly behaves as an independent Poisson process.',
    },
    {
      q: '14. Why does the observed rainfall count data show overdispersion relative to Poisson?',
      a: 'When we count monthly heavy rainfall events, the observed variance is significantly greater than the observed mean (Variance / Mean ≈ 2.5–3.5 > 1). This is overdispersion. Meteorologically, heavy rain events do not occur independently at a constant rate; they cluster into multi-day weather systems, cyclones, and monsoon spells. In our project, we explicitly report this overdispersion as a rigorous assumption check rather than blindly asserting a perfect Poisson fit.',
    },
    {
      q: '15. Why is the Normal distribution NOT appropriate for raw daily rainfall?',
      a: 'Raw daily rainfall violates the Normal distribution in two fundamental ways: (1) Non-negativity: Rainfall is strictly bounded below by zero (x ≥ 0), whereas a Normal distribution is defined on (-∞, +∞) and would predict negative rain. (2) Heavy positive skewness: A Gaussian bell curve is perfectly symmetric, while rainfall has a high spike at zero and a long right tail. Formal Kolmogorov-Smirnov (KS) tests reject the Normal fit for raw precipitation with p-value ≈ 0.',
    },
    {
      q: '16. What is Pearson correlation coefficient (r)?',
      a: 'Pearson\'s r = Cov(X, Y) / (s_x s_y) measures the strength and direction of a linear relationship between two continuous variables on a scale from -1 to +1. For example, relative humidity and rainfall typically exhibit positive Pearson correlation, while barometric pressure and rainfall often exhibit negative correlation because falling pressure indicates approaching convective storm systems.',
    },
    {
      q: '17. What is the difference between Pearson r and Spearman rank correlation ρ?',
      a: 'Pearson r evaluates strictly linear relationships and is sensitive to extreme outliers. Spearman ρ calculates the Pearson correlation on the ranks of the data, measuring monotonic relationships (whether Y increases when X increases, even if non-linearly). Because extreme precipitation outliers distort Pearson r, Spearman ρ provides a more robust measure of monotonic atmospheric associations.',
    },
    {
      q: '18. Does correlation imply causation?',
      a: 'No, correlation indicates statistical co-variation, not causal influence. For example, high humidity and low barometric pressure have high statistical association with rainfall, but humidity alone does not "cause" rain without thermodynamic lifting, cooling to dew point, and condensation nuclei. We explicitly phrase our findings as "statistical association" rather than causation.',
    },
    {
      q: '19. Why use multiple linear regression for rainfall prediction?',
      a: 'Rainfall is a multivariate atmospheric phenomenon that cannot be modeled by temperature or humidity alone. Multiple linear regression, ŷ = β₀ + β₁·Temp + β₂·Humidity + β₃·Pressure + β₄·Wind + β₅·RainLag1, allows us to quantify the partial contribution of each predictor while holding all other meteorological variables constant.',
    },
    {
      q: '20. Why MUST chronological train/test splitting be used instead of random train_test_split?',
      a: 'Weather observations form a time series with temporal autocorrelation. Randomly shuffling rows causes severe "temporal data leakage" (look-ahead bias), where the model is trained on future days and evaluated on past days, giving artificially inflated accuracy. A chronological split (first 80% dates for training, subsequent 20% for testing) guarantees that the model is evaluated strictly on unseen future dates.',
    },
    {
      q: '21. What is R² (Coefficient of Determination)?',
      a: 'R² = 1 - (SS_res / SS_tot) measures the proportion of variance in the response variable explained by the regression model compared to a simple horizontal baseline predicting the sample mean. On training data with an intercept, R² ranges from 0 to 1.',
    },
    {
      q: '22. Why can R² be negative on the hold-out validation set?',
      a: 'On an unseen chronological test set, R² is computed as R² = 1 - (∑(y_test - ŷ_test)² / ∑(y_test - ȳ_test)²). If the model\'s sum of squared prediction errors on unseen data is larger than the total variance around the test-set mean, R² becomes negative. This is a genuine validation result reflecting the high intermittency and non-linearity of zero-inflated weather data, confirming that a simple linear model does not explain all unseen variation. It is NOT a software bug.',
    },
    {
      q: '23. What is Mean Absolute Error (MAE)?',
      a: 'MAE = (1/n) ∑ |y_i - ŷ_i| represents the average absolute prediction error in physical units (millimeters of rain). For example, an MAE of 2.4 mm means that, on average, the regression model\'s predicted daily rainfall deviates from the actual observed depth by 2.4 mm.',
    },
    {
      q: '24. What is Root Mean Squared Error (RMSE)?',
      a: 'RMSE = √[(1/n) ∑ (y_i - ŷ_i)²] calculates the square root of average squared prediction errors. Because errors are squared before averaging, RMSE penalizes large errors much more heavily than MAE. The ratio RMSE / MAE > 1 highlights the presence of occasional large prediction errors during heavy storm spikes.',
    },
    {
      q: '25. What is Variance Inflation Factor (VIF)?',
      a: 'VIF_j = 1 / (1 - R_j²) measures the severity of multicollinearity by regressing predictor feature x_j on all other predictors. A VIF value equal to 1 indicates no correlation. A VIF > 5.0 indicates moderate to high multicollinearity, which inflates the variance of estimated coefficients and makes individual parameter interpretation unstable.',
    },
    {
      q: '26. What is temporal data leakage, and how is it prevented in this project?',
      a: 'Temporal data leakage occurs when future information is accidentally leaked into training features or model scaling. We prevent it by: (1) Splitting chronologically without shuffling, (2) Shifting lag features (rain_lag1) backward so today\'s predictor uses only yesterday\'s recorded rain, (3) Imputing the initial day-0 lag strictly using day-0 data, and (4) Passing future Open-Meteo forecast predictors only after model training is completely finished.',
    },
    {
      q: '27. Is our model prediction an official weather forecast?',
      a: 'No. Official forecasts are produced by national meteorological agencies (like IMD, NOAA, ECMWF) running physics-based numerical weather prediction (NWP) simulations on supercomputers. Our project generates an educational "Model-Based Statistical Estimate" by feeding external forecast predictors into our trained statistical regression equations with 95% approximate prediction intervals.',
    },
  ];

  const filteredQuestions = vivaQuestions.filter(
    (item) =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <GraduationCap className="w-4 h-4" />
          <span>Viva-Voce Academic Examination & Defense Guide</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Comprehensive 27-Question Statistical Defense Manual
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Curated mathematical and conceptual defense questions covering all 10 syllabus modules,
          meteorological data properties, hypothesis testing, and regression diagnostics for B.Tech examiners.
        </p>

        {/* Search filter */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search viva questions (e.g. Chebyshev, Poisson, R², VIF)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-[#111827] border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-start justify-between gap-4"
              >
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-white leading-snug">
                    {item.q}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 mt-1 space-y-2">
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Rigorous Statistical Answer:</span>
                  </div>
                  <p className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-slate-300 font-sans leading-relaxed">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

