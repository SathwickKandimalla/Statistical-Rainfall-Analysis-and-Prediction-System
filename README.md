# Statistical Rainfall Analysis and Prediction System (RainStat)

> **Academic Full-Stack Project for B.Tech Year 2 Term 1: Probability and Statistical Analysis**

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Title & Overview

- **Project Title:** Statistical Rainfall Analysis and Prediction System
- **Subtitle:** A Rigorous Probability and Statistical Analysis Platform for Atmospheric Precipitation Data
- **Platform Designation:** RainStat
- **Academic Context:** B.Tech Computer Science / Data Science / AI — Year 2, Term 1: Probability Theory and Statistics (P&S)

### Critical Academic Stance
This platform is **not** a generic weather portal, nor a black-box deep learning system. The core of this project is a **transparent, mathematically explainable statistical inference engine**. The interactive web interface serves as an exploratory laboratory through which students, professors, and researchers interact with classical probability axioms, distribution fittings, sampling theorems, hypothesis tests, and multiple linear/polynomial regression equations fitted on real-world atmospheric data.

---

## 2. Problem Statement

Meteorological repositories (such as ECMWF, Copernicus ERA5, and national weather bureaus) archive vast volumes of raw precipitation data. However, raw rainfall time series alone fail to answer critical engineering questions:
1. What is the empirical probability of extreme precipitation events under specific atmospheric preconditions?
2. Does the empirical distribution of rainfall follow a classical distribution (such as Gamma or Exponential), and can temperature or humidity be modeled by a Gaussian or Beta distribution?
3. What is the statistical significance when comparing recent seasonal precipitation to long-term historical baselines?
4. How do covariance and multicollinearity among atmospheric predictors affect short-term rainfall estimates?
5. How can we formulate an interpretable, non-negative model-based estimate accompanied by 95% prediction intervals without conflating statistical inference with official meteorological forecasts?

---

## 3. Project Objectives

1. **Acquire Real Atmospheric Data:** Ingest live, dynamic daily meteorological observations via the Open-Meteo Historical (Reanalysis) and Forecast APIs for any global coordinate (defaulting to Hyderabad, India: $17.3850^\circ\text{N}, 78.4867^\circ\text{E}$).
2. **Execute Data Quality Audit:** Validate response integrity, chronologically order data, check for discontinuities, detect missing or duplicate records, and report rainy vs. dry day frequencies.
3. **Rigorous Syllabus Mapping:** Provide interactive, fully verifiable computational modules covering the entire syllabus (Modules I through X).
4. **Enforce Academic Honesty:** Zero fabricated data, zero random shuffling on time-series evaluations, explicit non-negative physical constraints ($\ge 0.0\text{ mm}$), and transparent model limitations.
5. **Short-Term Predictive Modeling:** Train Ordinary Least Squares (OLS), Polynomial, and Multiple Linear models using an 80/20 chronological train/test split, feed future forecasted atmospheric inputs into the model, and evaluate performance with $R^2$, MAE, and RMSE.

---

## 4. Key Features

- **Live Geocoding & MapTiler Mapping:** Real-time city search powered by Open-Meteo Geocoding, visualized on an interactive MapLibre/MapTiler canvas with custom station pins and coordinate telemetry.
- **Descriptive Statistics & Inequality Verification:** Full univariate summary (Mean, Median, Mode, Variance, SD, Skewness, Kurtosis, IQR), Grouped Frequency Tables, Ogives, Box Plots, and Chebyshev's Inequality validator ($P(|X - \mu| < k\sigma) \ge 1 - 1/k^2$).
- **Probability Laboratory & Bayes' Theorem:** Interactive event builder ($A$: Rainfall $\ge$ Threshold, $B$: High Humidity / Temperature), Joint & Conditional Probabilities, statistical test of independence ($|P(A \cap B) - P(A)P(B)|$), and step-by-step Bayes' Theorem posterior calculator with $2 \times 2$ contingency matrix.
- **Random Variable Characterization:** Discrete vs. Continuous random variable classification, Empirical Probability Mass Function (PMF), Step Empirical Cumulative Distribution Function (ECDF), and expectation $E[X]$ and variance calculations.
- **Discrete & Continuous Distribution Labs:** 
  - *Discrete:* Binomial ($n, p$), Poisson ($\lambda$), Law of Rare Events comparison, and Moment Generating Function (MGF) derivations.
  - *Continuous:* Maximum Likelihood Estimation (MLE) fitting of Normal, Uniform, Exponential, Gamma, and Beta distributions with Kolmogorov-Smirnov (KS) goodness-of-fit hypothesis testing and scientific suitability warnings.
- **Sampling & Central Limit Theorem (CLT) Sandbox:** Simple Random and Stratified sampling simulations demonstrating how the sampling distribution of sample means converges to normality as $n$ scales, accompanied by Student's $t$ confidence intervals for means, Wald/Wilson intervals for proportions, Chi-squared variance bounds, and Snedecor's $F$-test for variance equality across two time periods.
- **Hypothesis Testing Engines:** One-sample Student's $t$-test for population mean and Two-tailed/One-tailed $Z$-test for rainy day proportions, displaying test statistics, rejection regions, $p$-values, significance levels ($\alpha$), and strict statistical verdicts ("Reject $H_0$" / "Fail to reject $H_0$").
- **Multivariate Correlation & Covariance:** Pearson product-moment coefficient $r$ with significance $p$-value, Spearman rank correlation $\rho$, sample covariance matrix, correlation heatmap, and interactive bivariate scatter plot with OLS trend lines.
- **Regression, Model Validation & Short-Term Prediction:**
  - Chronological 80% train / 20% test split to prevent temporal data leakage.
  - Simple Linear, Multiple Linear, and Polynomial regression models.
  - Variance Inflation Factor (VIF) multicollinearity diagnostics.
  - Holdout validation charts (Actual vs. Predicted, Residual plots, Residual histograms).
  - Short-term prediction using live 7-day Open-Meteo atmospheric forecast variables fed into our trained regression equation, complete with non-negative clamping and 95% approximate prediction intervals.
- **Comprehensive Educational Support:** Interactive LaTeX formula cards with variable legends, a 12-stage Mathematical Methodology flowchart, Data Source transparency audits, and an interactive Viva-Voce defense preparation center.

---

## 5. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5, Vite |
| **Styling & Icons** | Tailwind CSS v4, Lucide React Icons |
| **Data Visualization** | Recharts, MapLibre GL, MapTiler SDK |
| **Backend Framework** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Statistical Engine** | NumPy, pandas, SciPy (stats), statsmodels, scikit-learn |
| **External APIs** | Open-Meteo Geocoding, Historical Archive (ERA5), Open-Meteo Forecast |

---

## 6. System Architecture & Data Flow

```
[ User Search / Coordinate Selection ]
                 │
                 ▼
     [ Open-Meteo Geocoding API ]
                 │
                 ▼
[ Lat, Lon, Timezone, Selected Date Range ]
                 │
                 ▼
 [ Open-Meteo Historical Weather API ]  ──► (ERA5 Reanalysis Daily Data)
                 │
                 ▼
   [ Python Statistical Engine ] 
   ┌──────────────────────────────────────────────┐
   │ 1. Data Cleaning & Validation Pipeline        │
   │ 2. Module I: Descriptive Statistics          │
   │ 3. Module II: Probability & Bayes' Theorem    │
   │ 4. Module III: Random Variables & ECDF       │
   │ 5. Modules IV & V: Distribution Fitting      │
   │ 6. Module VI: Sampling, CLT, CIs & F-Test    │
   │ 7. Modules VII & VIII: Hypothesis Testing    │
   │ 8. Module IX: Correlation & Covariance       │
   │ 9. Module X: Chronological OLS Regression    │
   └──────────────────────────────────────────────┘
                 │
                 ├──────────────────────────────┐
                 ▼                              ▼
  [ Historical Validation Metrics ]   [ Open-Meteo Forecast API ]
  (MAE, RMSE, R², Residuals)           (Future 7-Day Predictor Inputs)
                 │                              │
                 │                              ▼
                 │                 [ Model-Based Rainfall Estimate ]
                 │                 (Non-negative, 95% Prediction Interval)
                 │                              │
                 └──────────────┬───────────────┘
                                ▼
         [ Interactive React Academic Analytics Dashboard ]
```

---

## 7. Syllabus Coverage (Modules I – X)

### Module I: Introduction to Statistics
- **Descriptive Metrics:** Mean ($\bar{x}$), Median, Empirical Mode, Range, Interquartile Range ($IQR = Q_3 - Q_1$), Sample Variance ($s^2$), Sample Standard Deviation ($s$), Coefficient of Variation ($CV = s/\bar{x} \times 100\%$), Fisher-Pearson Skewness ($g_1$), and Excess Kurtosis ($g_2$).
- **Visual Representations:** Grouped frequency distribution tables, Histograms with configurable binning, Less-than and Greater-than Cumulative Ogives, Box-and-Whisker plots with Tukey outlier thresholds ($1.5 \times IQR$), and Stem-and-Leaf representation for small sample subsets.
- **Chebyshev's Inequality:** For any real $k > 1$, lower bound $P(|X - \mu| < k\sigma) \ge 1 - 1/k^2$ is evaluated against empirical rainfall proportions.

### Module II: Introduction to Probability
- **Axiomatic Foundations:** Kolmogorov axioms ($0 \le P(A) \le 1$, $P(S) = 1$, additivity for mutually exclusive events).
- **Joint & Conditional Probability:** $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ and $P(A|B) = \frac{P(A \cap B)}{P(B)}$.
- **Event Independence Test:** Verification of $P(A \cap B) \approx P(A)P(B)$, reporting difference $\Delta$ and statistical verdict.
- **Bayes' Theorem:** Step-by-step posterior calculator:
  $$P(\text{Rain} \mid \text{High Humidity}) = \frac{P(\text{High Humidity} \mid \text{Rain}) \cdot P(\text{Rain})}{P(\text{High Humidity})}$$

### Module III: Random Variables
- **Classification:** Daily rainfall depth as a continuous random variable $X \in [0, \infty)$; Rainy day count as a discrete random variable $Y \in \{0, 1, \dots, n\}$.
- **Empirical Probability Functions:** Empirical Probability Density Function (histogram density) and Empirical Cumulative Distribution Function $F_n(x) = \frac{1}{n} \sum_{i=1}^n \mathbf{1}_{x_i \le x}$.
- **Moments:** First moment (Expectation $E[X] = \int x f(x)dx \approx \bar{x}$) and Second central moment (Variance $Var(X) = E[(X - \mu)^2]$).

### Module IV: Discrete Probability Distributions
- **Binomial Distribution:** $P(X = k) = \binom{n}{k} p^k (1-p)^{n-k}$, with $E[X] = np$ and $Var(X) = np(1-p)$, modeling the count of rainy days in $n$ calendar days.
- **Poisson Distribution:** $P(X = k) = \frac{\lambda^k e^{-\lambda}}{k!}$, with $E[X] = Var(X) = \lambda$, modeling rare extreme precipitation occurrences.
- **Law of Rare Events:** Transition demonstration showing $\lim_{n \to \infty, p \to 0, np = \lambda} \binom{n}{k} p^k (1-p)^{n-k} = \frac{\lambda^k e^{-\lambda}}{k!}$.
- **Moment Generating Functions:** 
  - Binomial: $M_X(t) = (1 - p + pe^t)^n$, yielding $E[X] = M'_X(0) = np$.
  - Poisson: $M_X(t) = e^{\lambda(e^t - 1)}$, yielding $E[X] = \lambda$, $E[X^2] = \lambda^2 + \lambda$.

### Module V: Continuous Probability Distributions
- **Continuous Distribution Fitting:** Maximum Likelihood Estimation (MLE) parameterization for:
  - **Normal:** $f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$ (evaluated on atmospheric temperature).
  - **Gamma:** $f(x) = \frac{\beta^\alpha}{\Gamma(\alpha)} x^{\alpha-1} e^{-\beta x}$ for $x > 0$ (rigorously fitted on positive rainfall depth).
  - **Exponential:** $f(x) = \lambda e^{-\lambda x}$ (memoryless model for rainfall duration/intensity).
  - **Uniform:** $f(x) = \frac{1}{b-a}$ (benchmark baseline).
  - **Beta:** $f(x) = \frac{1}{B(\alpha,\beta)} x^{\alpha-1} (1-x)^{\beta-1}$ (fitted on relative humidity transformed to $(0, 1)$).
- **Goodness-of-Fit Diagnostics:** Two-sample Kolmogorov-Smirnov test statistic $D = \sup_x |F_n(x) - F_0(x)|$ and $p$-value, coupled with scientific domain validity advice.

### Module VI: Sampling and Estimation
- **Sampling Methodologies:** Simple Random Sampling (SRS) with replacement / without replacement, and Monthly Stratified Sampling.
- **Central Limit Theorem (CLT):** Repeated simulation showing that as sample size $n$ increases, the distribution of sample means $\bar{X}$ approaches $\mathcal{N}(\mu, \sigma^2/n)$ regardless of the positive skewness of raw rainfall.
- **Interval Estimation:**
  - Student's $t$ Confidence Interval for Mean: $\bar{x} \pm t_{\alpha/2, n-1} \frac{s}{\sqrt{n}}$
  - Confidence Interval for Proportions: $\hat{p} \pm Z_{\alpha/2} \sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$
  - Chi-Squared CI for Population Variance: $\left[ \frac{(n-1)s^2}{\chi^2_{\alpha/2, n-1}}, \frac{(n-1)s^2}{\chi^2_{1-\alpha/2, n-1}} \right]$
  - Snedecor's $F$-Test for Equality of Variances: $F = s_1^2 / s_2^2$ with degrees of freedom $(n_1 - 1, n_2 - 1)$.

### Module VII: Testing of Hypothesis – I (Mean)
- **One-Sample Student's $t$-Test:** Evaluates null hypothesis $H_0: \mu = \mu_0$ versus two-tailed ($H_1: \mu \ne \mu_0$) or directional alternatives ($H_1: \mu > \mu_0$, $H_1: \mu < \mu_0$).
- **Formal Metrics:** Test statistic $t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}$, critical boundaries $\pm t_{\text{crit}}$, exact $p$-value, significance level $\alpha \in \{0.01, 0.05, 0.10\}$, and clear decision rules without erroneous colloquialisms.

### Module VIII: Testing of Hypothesis – II (Proportions)
- **One-Sample $Z$-Test for Proportions:** Formulates $H_0: p = p_0$ versus $H_1: p \ne p_0$ (e.g., comparing recent rainy day proportion against historical baseline).
- **Formal Metrics:** Test statistic $Z = \frac{\hat{p} - p_0}{\sqrt{\frac{p_0(1-p_0)}{n}}}$, two-tailed $p$-value, Type I error rate ($\alpha$), and Type II error context ($\beta$).

### Module IX: Correlation and Covariance
- **Sample Covariance:** $Cov(X, Y) = \frac{1}{n-1}\sum_{i=1}^n (x_i - \bar{x})(y_i - \bar{y})$.
- **Pearson Product-Moment Correlation:** $r = \frac{Cov(X, Y)}{s_X s_Y}$, measuring linear relationship strength, accompanied by two-tailed Student's $t$ test of significance ($t = r\sqrt{\frac{n-2}{1-r^2}}$).
- **Spearman Rank-Order Correlation:** $\rho = 1 - \frac{6 \sum d_i^2}{n(n^2 - 1)}$, assessing monotonic relationships resilient to skewed atmospheric extremes.
- **Multivariate Matrix:** Full heatmapped correlation matrix across rainfall, temperature, relative humidity, pressure, and wind speed.

### Module X: Regression and Short-Term Prediction
- **Model Formulations:**
  - Simple Linear: $\hat{y} = \beta_0 + \beta_1 x_1$
  - Multiple Linear: $\hat{y} = \beta_0 + \sum_{j=1}^p \beta_j x_j$
  - Polynomial (Degree 2): $\hat{y} = \beta_0 + \beta_1 x + \beta_2 x^2$
- **Multicollinearity Checks:** Variance Inflation Factor ($VIF_j = \frac{1}{1 - R_j^2}$), warning the user when $VIF > 5$.
- **Validation Pipeline:** Chronological 80% train / 20% test split, calculation of $R^2$, Adjusted $R^2$, MAE, and RMSE.
- **Physical Non-Negativity:** Enforcement of $\hat{y}_{\text{final}} = \max(0.0, \hat{y}_{\text{raw}})$.
- **Prediction Intervals:** Approximate $95\%$ interval $\hat{y} \pm t_{0.025, n-p-1} \cdot s_e \sqrt{1 + \frac{1}{n} + \dots}$.

---

## 8. Installation & Setup

### Prerequisites
- **Python 3.10+** (verified up to Python 3.14)
- **Node.js 18+** (verified on Node.js 24)
- **npm 9+**

### Repository Cloning
```bash
git clone https://github.com/your-username/rainstat-statistical-rainfall-analysis.git
cd rainstat-statistical-rainfall-analysis
```

---

## 9. Environment Variables

Create `.env` in the project root (or inside `frontend/`):

```bash
cp .env.example .env
```

### Configuration Parameters:
```env
# Optional: MapTiler API Key for vector satellite/streets basemaps
# If omitted or left as default, the map automatically renders OpenStreetMap raster tiles
VITE_MAPTILER_API_KEY=YOUR_MAPTILER_API_KEY

# Optional: Override default Open-Meteo API Endpoints (in backend/.env if needed)
OPEN_METEO_GEOCODING_URL=https://geocoding-api.open-meteo.com/v1/search
OPEN_METEO_HISTORICAL_URL=https://archive-api.open-meteo.com/v1/archive
OPEN_METEO_FORECAST_URL=https://api.open-meteo.com/v1/forecast
```

---

## 10. Running the Application

### Option A: Running Backend (FastAPI)
```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install required Python dependencies
pip install -r requirements.txt
# (or: pip install fastapi uvicorn httpx numpy pandas scipy scikit-learn statsmodels pytest pydantic)

# Start backend ASGI server
python -m uvicorn app.main:app --port 8000 --reload
```
The backend API documentation is now live at:
- **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Endpoint:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Option B: Running Frontend (React + Vite)
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open your browser at:
- **Local Application:** [http://localhost:5173](http://localhost:5173)

---

## 11. Backend Unit Testing

RainStat includes a comprehensive pytest suite validating all statistical algorithms, hypothesis engines, and API parsers against known mathematical ground truths.

```bash
# From workspace root or backend directory:
cd backend
python -m pytest app/tests -v
```

### Verified Test Suite:
1. `test_geocoding_parsing` — Open-Meteo response transformation into structured schemas.
2. `test_data_cleaning` — Linear interpolation, duplicate elimination, and continuous date sorting.
3. `test_descriptive_statistics` — Mean, variance, sample standard deviation, IQR, skewness, and Chebyshev lower bounds.
4. `test_probability_and_bayes` — Empirical event probability, joint probability, and Bayes' posterior resolution.
5. `test_random_variables` — ECDF step heights and probability mass function convergence.
6. `test_discrete_distributions` — Binomial and Poisson PMF calculations, expectations, and MGF formulas.
7. `test_continuous_distributions` — MLE parameter estimates and Kolmogorov-Smirnov test diagnostics.
8. `test_sampling_and_clt` — Sampling distribution standard error ($\sigma / \sqrt{n}$) and confidence intervals.
9. `test_hypothesis_testing` — Student's $t$-statistic, critical values, and two-tailed rejection decisions.
10. `test_correlation_and_regression` — Pearson $r$, covariance, OLS coefficients, $R^2$, and non-negative clamping.

**Current Test Status:** `10 passed in ~6.8 seconds (100% Pass Rate)`

---

## 12. Project Structure

```
Rainwall analysis P&S/
├── .env.example                    # Global environment template
├── .gitignore                      # Git exclusion rules
├── README.md                       # Comprehensive academic documentation
│
├── backend/
│   ├── .env.example                # Backend environment template
│   └── app/
│       ├── main.py                 # FastAPI application factory & CORS configuration
│       ├── config.py               # Global settings, default coords, API URLs, TTL
│       ├── api/
│       │   ├── location_routes.py  # Geocoding endpoints
│       │   ├── weather_routes.py   # Historical reanalysis ingestion & validation
│       │   ├── analysis_routes.py  # Modules I - IX statistical endpoints
│       │   └── prediction_routes.py# Module X regression training & forecast estimation
│       ├── models/                 # Domain models
│       ├── schemas/
│       │   └── request_schemas.py  # Pydantic validation schemas
│       ├── services/
│       │   ├── weather_service.py         # Open-Meteo HTTP client with in-memory caching
│       │   ├── data_cleaning_service.py   # Quality audits, imputation, schema mappers
│       │   ├── statistics_service.py      # Module I: Descriptive stats, Ogives, Chebyshev
│       │   ├── probability_service.py     # Module II: Bayes, Joint, Independence
│       │   ├── random_variable_service.py # Module III: PMF, ECDF, Expectation
│       │   ├── distribution_service.py    # Modules IV & V: MLE fitting & KS tests
│       │   ├── sampling_service.py        # Module VI: CLT simulation, CIs, F-test
│       │   ├── hypothesis_service.py      # Modules VII & VIII: t-test & proportion Z-test
│       │   ├── correlation_service.py     # Module IX: Pearson, Spearman, Covariance
│       │   ├── regression_service.py      # Module X: OLS, Poly, VIF, Holdout evaluation
│       │   └── prediction_service.py      # Forecast input ingestion & 95% intervals
│       └── tests/
│           └── test_statistical_engine.py# 10 comprehensive unit tests
│
└── frontend/
    ├── .env.example                # Frontend environment template
    ├── package.json                # npm dependencies and build scripts
    ├── vite.config.ts              # Vite bundler configuration
    ├── tsconfig.json               # TypeScript configuration
    └── src/
        ├── App.tsx                 # Root component with master state & tab router
        ├── main.tsx                # React DOM entrypoint
        ├── index.css               # Design system & dark theme tokens
        ├── types/
        │   └── index.ts            # TypeScript interfaces for all payloads
        ├── services/
        │   └── api.ts              # Strongly typed Axios/Fetch service layer
        ├── components/
        │   ├── Navbar.tsx          # Top station telemetry & navigation trigger
        │   ├── Sidebar.tsx         # Academic module sidebar navigation
        │   ├── LocationMap.tsx     # MapLibre GL / MapTiler vector station view
        │   ├── LocationSearchModal.tsx # Live city geocoding modal
        │   ├── DateRangeModal.tsx  # Historical period selector modal
        │   ├── DataQualityPanel.tsx# Quality metrics, continuity, & audit logs
        │   ├── DataTable.tsx       # Paginated, searchable data table with CSV export
        │   └── FormulaCard.tsx     # LaTeX mathematical cards with variable legends
        └── pages/
            ├── OverviewPage.tsx         # Executive dashboard with rainfall charts
            ├── DataExplorerPage.tsx     # Quality audit, secondary CSV upload, & table
            ├── DescriptiveStatsPage.tsx # Module I: Statistics, Ogive, Chebyshev
            ├── ProbabilityPage.tsx      # Module II: Bayes & event independence
            ├── RandomVariablesPage.tsx  # Module III: Continuous ECDF & discrete PMF
            ├── DistributionsPage.tsx    # Modules IV & V: Binomial, Poisson, Gamma MLE
            ├── SamplingPage.tsx         # Module VI: CLT simulation, CIs, F-test
            ├── HypothesisPage.tsx       # Modules VII & VIII: t-tests & proportion tests
            ├── CorrelationPage.tsx      # Module IX: Pearson, Spearman, heatmap matrix
            ├── RegressionPage.tsx       # Module X: Multiple regression & short-term prediction
            ├── MethodologyPage.tsx      # 12-stage mathematical methodology pipeline
            ├── VivaGuidePage.tsx        # 10 university examination viva defense Q&As
            └── DataSourcePage.tsx       # ERA5 reanalysis provenance & variable definitions
```

---

## 13. Mathematical Methodology

$$\begin{array}{rcc}
\text{Raw Reanalysis Observations } (x_i, y_i) & \longrightarrow & \text{Data Quality Verification \& Imputation} \\
& & \downarrow \\
\text{Module I: Univariate Summary Statistics} & \longleftarrow & \bar{x} = \frac{1}{n}\sum x_i, \quad s^2 = \frac{1}{n-1}\sum (x_i - \bar{x})^2 \\
& & \downarrow \\
\text{Module II: Axiomatic Probability} & \longleftarrow & P(A \mid B) = \frac{P(B \mid A)P(A)}{P(B)} \\
& & \downarrow \\
\text{Module III: Random Variable CDF} & \longleftarrow & F_n(x) = \frac{1}{n} \sum_{i=1}^n \mathbf{1}_{x_i \le x} \\
& & \downarrow \\
\text{Module IV \& V: MLE Fitting} & \longleftarrow & \ln L(\theta) = \sum_{i=1}^n \ln f(x_i; \theta) \\
& & \downarrow \\
\text{Module VI: Sampling \& CLT} & \longleftarrow & \bar{X}_n \xrightarrow{d} \mathcal{N}\left(\mu, \frac{\sigma^2}{n}\right) \\
& & \downarrow \\
\text{Module VII \& VIII: Hypothesis Tests} & \longleftarrow & t = \frac{\bar{x} - \mu_0}{s / \sqrt{n}}, \quad Z = \frac{\hat{p} - p_0}{\sqrt{\frac{p_0(1-p_0)}{n}}} \\
& & \downarrow \\
\text{Module IX: Covariance \& Correlation} & \longleftarrow & r = \frac{\sum (x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum (x_i - \bar{x})^2 \sum (y_i - \bar{y})^2}} \\
& & \downarrow \\
\text{Module X: Chronological Regression} & \longleftarrow & \hat{\boldsymbol{\beta}} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{y} \\
& & \downarrow \\
\text{Short-Term Predictive Estimation} & \longleftarrow & \hat{y}_{\text{pred}} = \max(0.0, \mathbf{x}_{\text{forecast}}^T \hat{\boldsymbol{\beta}}) \pm t_{\alpha/2} s_e \sqrt{1 + \dots}
\end{array}$$

---

## 14. Model Validation & Evaluation Metrics

1. **Mean Absolute Error (MAE):**
   $$MAE = \frac{1}{n_{\text{test}}} \sum_{i=1}^{n_{\text{test}}} |y_i - \hat{y}_i|$$
   Measures the average magnitude of absolute prediction discrepancies in millimeters.
2. **Root Mean Squared Error (RMSE):**
   $$RMSE = \sqrt{\frac{1}{n_{\text{test}}} \sum_{i=1}^{n_{\text{test}}} (y_i - \hat{y}_i)^2}$$
   Penalizes large prediction errors severely, critical for flood and storm risk assessments.
3. **Coefficient of Determination ($R^2$):**
   $$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$$
   Quantifies the proportion of rainfall variance explained by atmospheric covariates.

---

## 15. Limitations & Scientific Boundaries

1. **Reanalysis vs. Physical Rain Gauges:** Historical data is sourced from Open-Meteo ERA5 atmospheric reanalysis grids rather than direct laser disdrometers or tipping-bucket gauges at exact street addresses.
2. **Extreme Positive Skewness:** Because rainfall is zero-inflated (many dry days with 0.0 mm), standard Ordinary Least Squares (OLS) models produce low $R^2$ values ($0.15 - 0.35$). This is mathematically expected and demonstrates academic honesty.
3. **Multicollinearity:** Temperature, solar radiation, and relative humidity exhibit strong physical dependencies. The VIF diagnostic flags these relationships.
4. **Prediction Horizon:** Statistical regression driven by forecasted synoptic conditions cannot replace dynamic Numerical Weather Prediction (NWP) supercomputer models (e.g., ECMWF IFS, GFS).

---

## 16. University Examination Viva-Voce Defense (Top 10 Questions)

#### Q1: Why is raw rainfall not normally distributed, and how does your project address this?
> **Answer:** Rainfall data is non-negative and zero-inflated (most days have 0 mm rain), resulting in extreme positive skewness ($g_1 \gg 1$). In our project, Module V fits a two-parameter **Gamma distribution** $\text{Gamma}(\alpha, \beta)$ to non-zero precipitation amounts and evaluates fit using the Kolmogorov-Smirnov test, while Gaussian models are reserved for symmetric variables such as daily mean temperature.

#### Q2: Why is random shuffling strictly forbidden when evaluating time-series rainfall regression models?
> **Answer:** Atmospheric data exhibits serial autocorrelation and seasonal periodicity. Randomly shuffling observations would leak future seasonal patterns into past training periods. We implement a strict **chronological 80% train / 20% test split** where the model is fitted exclusively on earlier years and evaluated on subsequent holdout periods.

#### Q3: Why do linear regression equations predict negative rainfall, and how is it resolved?
> **Answer:** Classical linear regression models assume an unbounded continuous domain $\hat{y} \in (-\infty, \infty)$. When humidity is low and pressure is high, the linear hyper-plane can evaluate to negative values. We enforce a physical non-negativity constraint $\hat{y}_{\text{final}} = \max(0.0, \hat{y}_{\text{raw}})$ and document this thresholding in the interface.

#### Q4: What is the practical difference between Chebyshev's Inequality and empirical normality bounds?
> **Answer:** The empirical rule assumes an exact Gaussian distribution ($68\% \pm 1\sigma, 95\% \pm 2\sigma$). In contrast, Chebyshev's Inequality is non-parametric and holds for **any** probability distribution with finite variance, guaranteeing at least $1 - 1/k^2$ of values lie within $k$ standard deviations (e.g., $\ge 75\%$ for $k=2$). Module I demonstrates that empirical rainfall strictly respects this mathematical lower bound.

#### Q5: How is Bayes' Theorem used in this meteorological platform?
> **Answer:** It updates prior precipitation probability $P(\text{Rain})$ upon observing atmospheric evidence such as high relative humidity ($H$). Using $P(\text{Rain}|H) = \frac{P(H|\text{Rain})P(\text{Rain})}{P(H)}$, Module II calculates the true posterior likelihood from real joint frequencies.

#### Q6: When does the Poisson distribution serve as an appropriate model for rainfall?
> **Answer:** By the Law of Rare Events, when sample size $n$ is large (e.g., 365 days) and event probability $p$ of extreme deluge ($>50\text{ mm}$) is small, the Binomial distribution converges to Poisson with $\lambda = np$. Module IV validates whether the sample mean equals the sample variance ($\bar{x} \approx s^2$), which is the defining property of an equidispersed Poisson process.

#### Q7: How does your sampling module demonstrate the Central Limit Theorem?
> **Answer:** Even though individual daily rainfall values are heavily skewed, Module VI draws 500 repeated random samples of size $n$. As $n$ increases from 5 to 50, the histogram of sample means $\bar{X}$ transforms into a bell-shaped Gaussian distribution with standard error converging to $\frac{\sigma}{\sqrt{n}}$.

#### Q8: What does a $p$-value represent in your hypothesis testing module?
> **Answer:** The $p$-value is the probability of observing a test statistic as extreme as, or more extreme than, the computed value, assuming the null hypothesis $H_0$ is true. If $p < \alpha$ (e.g., $0.05$), we reject $H_0$. It does **not** represent the probability that the null hypothesis is true.

#### Q9: What is the difference between Pearson $r$ and Spearman $\rho$ for weather data?
> **Answer:** Pearson $r$ measures linear association and is sensitive to extreme precipitation outliers. Spearman $\rho$ evaluates monotonic relationships by ranking the data, making it robust against non-linear precipitation surges.

#### Q10: Why is your prediction labeled "Model-Based Statistical Estimate" rather than an "Official Weather Forecast"?
> **Answer:** Official forecasts utilize Navier-Stokes fluid dynamics, Doppler radar, satellite sounding, and thermodynamic numerical modeling. RainStat applies statistical regression equations trained on historical reanalysis to forecasted atmospheric predictors. Clarifying this distinction maintains scientific integrity.

---

## 17. License & Academic Attribution

This project is developed for educational and academic evaluation under the B.Tech Computer Science and Engineering curriculum. Distributed under the MIT License. Atmospheric data provided by [Open-Meteo](https://open-meteo.com) under CC BY 4.0. Basemap tiles courtesy of [MapTiler](https://maptiler.com) and [OpenStreetMap](https://openstreetmap.org).
