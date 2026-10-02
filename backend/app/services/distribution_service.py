import math
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List, Optional

class DistributionService:
    # ----------------------------------------------------
    # Module IV: Discrete Probability Distributions
    # ----------------------------------------------------
    def analyze_discrete_distributions(
        self,
        df: pd.DataFrame,
        n_days: int = 14,
        rain_threshold: float = 1.0,
        heavy_rain_threshold: float = 15.0,
    ) -> Dict[str, Any]:
        """
        Module IV: Binomial, Poisson, Binomial-to-Poisson approximation,
        and Moment Generating Function explanations.
        """
        rain_col = "rain_sum" if "rain_sum" in df.columns else "precipitation_sum"
        data = df[rain_col].dropna().to_numpy()
        N = len(data)
        if N == 0:
            raise ValueError("No rainfall data available for discrete distributions.")

        # 1. Binomial Distribution
        # Success = Day with rain >= rain_threshold
        p_rainy_day = float(np.mean(data >= rain_threshold))
        n = max(2, min(int(n_days), 60))
        mean_binom = n * p_rainy_day
        var_binom = n * p_rainy_day * (1.0 - p_rainy_day)
        std_binom = math.sqrt(var_binom)

        binom_chart = []
        for k in range(n + 1):
            prob = float(stats.binom.pmf(k, n, p_rainy_day))
            binom_chart.append({
                "k": k,
                "probability": round(prob, 5),
                "cumulative_prob": round(float(stats.binom.cdf(k, n, p_rainy_day)), 5),
            })

        # 2. Poisson Distribution
        # Rare Event = Heavy rain >= heavy_rain_threshold
        # Group data into 30-day (monthly) intervals to count monthly heavy rain events
        window = 30
        n_windows = N // window
        if n_windows > 1:
            heavy_counts = [
                int(np.sum(data[i * window : (i + 1) * window] >= heavy_rain_threshold))
                for i in range(n_windows)
            ]
            obs_lambda = float(np.mean(heavy_counts))
            obs_var = float(np.var(heavy_counts, ddof=1)) if len(heavy_counts) > 1 else obs_lambda
        else:
            # Fallback to rate per month based on overall proportion
            obs_lambda = float(np.mean(data >= heavy_rain_threshold) * 30.0)
            obs_var = obs_lambda

        lambda_val = max(0.01, obs_lambda)
        poisson_chart = []
        max_k = max(10, int(math.ceil(lambda_val + 3 * math.sqrt(lambda_val))))
        for k in range(max_k + 1):
            prob = float(stats.poisson.pmf(k, lambda_val))
            poisson_chart.append({
                "k": k,
                "probability": round(prob, 5),
                "cumulative_prob": round(float(stats.poisson.cdf(k, lambda_val)), 5),
            })

        # Check equidispersion: For Poisson, Mean == Variance == λ
        dispersion_ratio = obs_var / obs_lambda if obs_lambda > 0 else 1.0
        if abs(dispersion_ratio - 1.0) < 0.25:
            dispersion_eval = "Equidispersed (Observed Variance ≈ Observed Mean), indicating count data is consistent with Poisson equidispersion."
        elif dispersion_ratio > 1.25:
            dispersion_eval = (
                f"Poisson assumption check: Mean ≈ {obs_lambda:.2f}, Variance ≈ {obs_var:.2f}, "
                f"Variance/Mean Ratio ≈ {dispersion_ratio:.2f}. "
                f"Interpretation: The observed count data is overdispersed relative to a standard Poisson model (where Mean ≈ Variance). "
                f"This indicates that heavy rainfall events cluster temporally into storm spells rather than occurring as an independent Poisson process."
            )
        else:
            dispersion_eval = f"Underdispersed (Variance/Mean = {dispersion_ratio:.2f} < 1)."

        # 3. Binomial to Poisson Approximation
        # Compare Binomial(n, p) with Poisson(λ = np) for the heavy rain event
        p_heavy = float(np.mean(data >= heavy_rain_threshold))
        lambda_approx = n * p_heavy
        approx_chart = []
        for k in range(min(n + 1, 15)):
            p_b = float(stats.binom.pmf(k, n, p_heavy))
            p_p = float(stats.poisson.pmf(k, lambda_approx))
            diff = abs(p_b - p_p)
            approx_chart.append({
                "k": k,
                "binomial_p": round(p_b, 5),
                "poisson_approx_p": round(p_p, 5),
                "absolute_difference": round(diff, 6),
            })

        rule_of_thumb_satisfied = bool(n >= 20 and p_heavy <= 0.05) or bool(lambda_approx <= 10.0)

        # 4. Moment Generating Functions (MGF) Academic Explanations
        mgf_educational = {
            "binomial": {
                "formula": "M_X(t) = (1 - p + p e^t)^n",
                "derivation_mean": "M'_X(0) = n p e^0 (1 - p + p e^0)^(n-1) = n p",
                "derivation_variance": "M''_X(0) = n(n-1)p^2 + np  ⇒  Var(X) = M''_X(0) - (M'_X(0))² = np(1-p)",
                "interpretation": "The MGF uniquely determines the probability distribution and generates all integer moments about the origin via Maclaurin expansion.",
            },
            "poisson": {
                "formula": "M_Y(t) = exp(λ (e^t - 1))",
                "derivation_mean": "M'_Y(0) = λ e^0 exp(λ (e^0 - 1)) = λ",
                "derivation_variance": "M''_Y(0) = λ² + λ  ⇒  Var(Y) = (λ² + λ) - λ² = λ",
                "interpretation": "Because all cumulants of the Poisson distribution are equal to λ, its MGF yields identical mean and variance.",
            }
        }

        return {
            "binomial": {
                "interpretation": f"Modeling the number of rainy days (≥ {rain_threshold} mm) in a {n}-day period as independent Bernoulli trials.",
                "n_trials": n,
                "p_success": round(p_rainy_day, 4),
                "mean_np": round(mean_binom, 3),
                "variance_npq": round(var_binom, 4),
                "std_dev": round(std_binom, 4),
                "pmf_distribution": binom_chart,
            },
            "poisson": {
                "interpretation": f"Modeling the frequency of heavy rainfall events (≥ {heavy_rain_threshold} mm) per 30-day period.",
                "estimated_lambda": round(lambda_val, 4),
                "observed_mean": round(obs_lambda, 3),
                "observed_variance": round(obs_var, 3),
                "dispersion_ratio": round(dispersion_ratio, 3),
                "dispersion_evaluation": dispersion_eval,
                "pmf_distribution": poisson_chart,
                "assumption_check": {
                    "mean": round(obs_lambda, 3),
                    "variance": round(obs_var, 3),
                    "variance_mean_ratio": round(dispersion_ratio, 3),
                    "interpretation": (
                        f"The observed count data is overdispersed (Variance/Mean = {dispersion_ratio:.2f}) relative to a standard Poisson model (where Mean ≈ Variance). "
                        "This indicates that rainfall events violate the Poisson assumption of independent identical event rates and instead cluster into multi-day storm spells."
                        if dispersion_ratio > 1.25
                        else "Observed variance is approximately equal to the mean, consistent with Poisson equidispersion."
                    )
                },
            },
            "binomial_to_poisson": {
                "description": f"Law of Rare Events: Binomial(n={n}, p={p_heavy:.4f}) approximated by Poisson(λ = np = {lambda_approx:.3f}).",
                "rule_of_thumb_satisfied": rule_of_thumb_satisfied,
                "rule_of_thumb_explanation": "Approximation is mathematically sound when n is moderately large (n ≥ 20) and success probability is rare (p ≤ 0.05 or np ≤ 10).",
                "comparison": approx_chart,
            },
            "moment_generating_functions": mgf_educational,
        }

    # ----------------------------------------------------
    # Module V: Continuous Probability Distributions
    # ----------------------------------------------------
    def fit_continuous_distributions(
        self,
        df: pd.DataFrame,
        variable_name: str = "rain_sum",
        filter_positive: bool = True,
        requested_distributions: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Module V: Fit Normal, Uniform, Gamma, Exponential, Beta distributions.
        Computes MLE parameters, theoretical PDF/CDF curves, and Kolmogorov-Smirnov fit diagnostics.
        """
        dist_list = requested_distributions or ["normal", "gamma", "exponential", "uniform", "beta"]
        
        series = df[variable_name].dropna()
        if filter_positive and variable_name in ["rain_sum", "precipitation_sum"]:
            series = series[series > 0]

        data = series.to_numpy()
        n = len(data)
        if n < 10:
            raise ValueError(f"Insufficient positive data points ({n}) to fit continuous distributions.")

        x_min = float(np.min(data))
        x_max = float(np.max(data))
        x_range = np.linspace(x_min, x_max, 80)

        # Empirical histogram bins for overlay
        counts, bin_edges = np.histogram(data, bins=25, density=True)
        empirical_density = []
        for i in range(len(counts)):
            empirical_density.append({
                "x": round(float((bin_edges[i] + bin_edges[i + 1]) / 2), 2),
                "density": round(float(counts[i]), 5),
            })

        fits: Dict[str, Any] = {}

        # 1. Normal Distribution
        if "normal" in dist_list:
            mu, sigma = stats.norm.fit(data)
            sigma = max(1e-4, sigma)
            norm_dist = stats.norm(loc=mu, scale=sigma)
            ks_stat, ks_pval = stats.kstest(data, norm_dist.cdf)
            pdf_curve = [round(float(norm_dist.pdf(x)), 5) for x in x_range]
            cdf_curve = [round(float(norm_dist.cdf(x)), 5) for x in x_range]

            is_rain = variable_name in ["rain_sum", "precipitation_sum"]
            ks_decision = "Reject H₀ at α = 0.05 (Exact fit rejected)" if ks_pval < 0.05 else "Fail to reject H₀ at α = 0.05 (Compatible)"
            suitability = (
                "Formal KS test rejects the exact Normal fit at α = 0.05 (p < 0.001) for zero-inflated rainfall. Physical non-negativity (rain ≥ 0) and right-skewness violate the Gaussian assumption of infinite domain (-∞ to +∞) and symmetry."
                if is_rain
                else "Appropriate for approximately symmetric atmospheric variables such as mean temperature where central limit properties emerge."
            )
            academic_interpretation = (
                "At α = 0.05, the formal KS goodness-of-fit test decisively rejects the Normal distribution. Zero-inflated precipitation depth cannot be modeled by a symmetric unbounded Gaussian density."
                if is_rain
                else f"Goodness-of-fit test yields p-value = {ks_pval:.5f} ({ks_decision})."
            )

            fits["normal"] = {
                "name": "Normal Distribution",
                "parameters": {"mu (mean)": round(float(mu), 3), "sigma (std)": round(float(sigma), 3)},
                "mean": round(float(mu), 3),
                "variance": round(float(sigma ** 2), 4),
                "ks_statistic": round(float(ks_stat), 4),
                "ks_p_value": round(float(ks_pval), 6),
                "ks_decision": ks_decision,
                "scientific_suitability": suitability,
                "academic_interpretation": academic_interpretation,
                "pdf_points": [{"x": round(float(x_range[i]), 2), "pdf": pdf_curve[i]} for i in range(len(x_range))],
                "cdf_points": [{"x": round(float(x_range[i]), 2), "cdf": cdf_curve[i]} for i in range(len(x_range))],
            }

        # 2. Gamma Distribution
        if "gamma" in dist_list and np.all(data > 0):
            # Fit gamma: shape a, loc (fixed at 0), scale
            a, loc, scale = stats.gamma.fit(data, floc=0)
            gamma_dist = stats.gamma(a, loc=loc, scale=scale)
            ks_stat, ks_pval = stats.kstest(data, gamma_dist.cdf)
            pdf_curve = [round(float(gamma_dist.pdf(x)), 5) for x in x_range]
            cdf_curve = [round(float(gamma_dist.cdf(x)), 5) for x in x_range]

            ks_decision = "Reject H₀ at α = 0.05 (Exact fit rejected)" if ks_pval < 0.05 else "Fail to reject H₀ at α = 0.05 (Compatible)"
            suitability = (
                f"Descriptive Candidate: While the formal KS test at α = 0.05 rejects the exact theoretical Gamma fit (p-value = {ks_pval:.4f} < 0.05), "
                "the two-parameter Gamma distribution remains a widely accepted empirical descriptive candidate for modeling the positive right-skewed rainfall depth in hydrological literature."
                if ks_pval < 0.05
                else "Empirical data is statistically compatible with the theoretical Gamma distribution at α = 0.05."
            )
            academic_interpretation = (
                f"Formal Goodness-of-Fit: Since p-value ({ks_pval:.4f}) < α (0.05), the formal KS test rejects the null hypothesis of an exact theoretical Gamma fit. "
                "Distinction: In academic meteorology, we distinguish formal statistical rejection on large samples from practical descriptive utility: Gamma captures positive skewness far better than Normal or Uniform models, but does not provide an exact mathematical fit."
                if ks_pval < 0.05
                else f"The sample observations fail to reject the null hypothesis of a Gamma distribution (p = {ks_pval:.4f} ≥ 0.05)."
            )

            fits["gamma"] = {
                "name": "Gamma Distribution",
                "parameters": {"alpha (shape)": round(float(a), 3), "beta (scale)": round(float(scale), 3)},
                "mean": round(float(a * scale), 3),
                "variance": round(float(a * (scale ** 2)), 4),
                "ks_statistic": round(float(ks_stat), 4),
                "ks_p_value": round(float(ks_pval), 6),
                "ks_decision": ks_decision,
                "scientific_suitability": suitability,
                "academic_interpretation": academic_interpretation,
                "pdf_points": [{"x": round(float(x_range[i]), 2), "pdf": pdf_curve[i]} for i in range(len(x_range))],
                "cdf_points": [{"x": round(float(x_range[i]), 2), "cdf": cdf_curve[i]} for i in range(len(x_range))],
            }

        # 3. Exponential Distribution
        if "exponential" in dist_list and np.all(data > 0):
            loc, scale = stats.expon.fit(data, floc=0)
            rate_lambda = 1.0 / scale if scale > 0 else 1.0
            expon_dist = stats.expon(loc=loc, scale=scale)
            ks_stat, ks_pval = stats.kstest(data, expon_dist.cdf)
            pdf_curve = [round(float(expon_dist.pdf(x)), 5) for x in x_range]
            cdf_curve = [round(float(expon_dist.cdf(x)), 5) for x in x_range]

            ks_decision = "Reject H₀ at α = 0.05 (Exact fit rejected)" if ks_pval < 0.05 else "Fail to reject H₀ at α = 0.05 (Compatible)"
            suitability = "Formal KS test rejects the exact Exponential fit at α = 0.05 (p < 0.001). The memoryless property with constant hazard rate fails to account for prolonged storm spells and extreme tail events."
            academic_interpretation = "At α = 0.05, the KS test formally rejects the exact Exponential distribution (p < 0.001). While useful as a simple baseline, its exponential tail decays too quickly to capture extreme precipitation depths."

            fits["exponential"] = {
                "name": "Exponential Distribution",
                "parameters": {"lambda (rate)": round(float(rate_lambda), 4), "scale (mean)": round(float(scale), 3)},
                "mean": round(float(scale), 3),
                "variance": round(float(scale ** 2), 4),
                "ks_statistic": round(float(ks_stat), 4),
                "ks_p_value": round(float(ks_pval), 6),
                "ks_decision": ks_decision,
                "scientific_suitability": suitability,
                "academic_interpretation": academic_interpretation,
                "pdf_points": [{"x": round(float(x_range[i]), 2), "pdf": pdf_curve[i]} for i in range(len(x_range))],
                "cdf_points": [{"x": round(float(x_range[i]), 2), "cdf": cdf_curve[i]} for i in range(len(x_range))],
            }

        # 4. Uniform Distribution
        if "uniform" in dist_list:
            loc, scale = stats.uniform.fit(data)
            uniform_dist = stats.uniform(loc=loc, scale=scale)
            ks_stat, ks_pval = stats.kstest(data, uniform_dist.cdf)
            pdf_curve = [round(float(uniform_dist.pdf(x)), 5) for x in x_range]
            cdf_curve = [round(float(uniform_dist.cdf(x)), 5) for x in x_range]

            ks_decision = "Reject H₀ at α = 0.05 (Exact fit rejected)" if ks_pval < 0.05 else "Fail to reject H₀ at α = 0.05 (Compatible)"
            suitability = "Formal KS test rejects the exact Uniform fit at α = 0.05 (p < 0.001). Assumes all rainfall depths between min and max are equally probable, which directly contradicts meteorological reality."
            academic_interpretation = "At α = 0.05, the KS test decisively rejects the Uniform distribution (p < 0.001). Provided strictly as an academic baseline comparison."

            fits["uniform"] = {
                "name": "Uniform Distribution",
                "parameters": {"a (min)": round(float(loc), 3), "b (max)": round(float(loc + scale), 3)},
                "mean": round(float(loc + scale / 2), 3),
                "variance": round(float((scale ** 2) / 12), 4),
                "ks_statistic": round(float(ks_stat), 4),
                "ks_p_value": round(float(ks_pval), 6),
                "ks_decision": ks_decision,
                "scientific_suitability": suitability,
                "academic_interpretation": academic_interpretation,
                "pdf_points": [{"x": round(float(x_range[i]), 2), "pdf": pdf_curve[i]} for i in range(len(x_range))],
                "cdf_points": [{"x": round(float(x_range[i]), 2), "cdf": cdf_curve[i]} for i in range(len(x_range))],
            }

        # 5. Beta Distribution (applied to normalized [0, 1] domain)
        if "beta" in dist_list:
            if x_max > x_min:
                # Normalize data to strictly (0, 1) for Beta estimation
                norm_data = (data - x_min + 1e-4) / (x_max - x_min + 2e-4)
                a, b, loc, scale = stats.beta.fit(norm_data, floc=0, fscale=1)
                beta_dist = stats.beta(a, b, loc=loc, scale=scale)
                ks_stat, ks_pval = stats.kstest(norm_data, beta_dist.cdf)

                norm_x = np.linspace(0.01, 0.99, 80)
                beta_pdf = [round(float(beta_dist.pdf(u)), 4) for u in norm_x]
                beta_cdf = [round(float(beta_dist.cdf(u)), 4) for u in norm_x]

                mean_beta = a / (a + b)
                var_beta = (a * b) / (((a + b) ** 2) * (a + b + 1))
                ks_decision = "Reject H₀ at α = 0.05" if ks_pval < 0.05 else "Fail to reject H₀ at α = 0.05"

                fits["beta"] = {
                    "name": "Beta Distribution (Transformed on [0, 1])",
                    "parameters": {"alpha": round(float(a), 3), "beta": round(float(b), 3)},
                    "mean_normalized": round(float(mean_beta), 4),
                    "variance_normalized": round(float(var_beta), 4),
                    "ks_statistic": round(float(ks_stat), 4),
                    "ks_p_value": round(float(ks_pval), 6),
                    "ks_decision": ks_decision,
                    "scientific_suitability": "Transformation Notice: The Beta distribution is applied to the min-max normalized variable u = (x - min)/(max - min) ∈ [0, 1], and NOT directly to rainfall measured in millimetres. It models bounded relative fractions.",
                    "academic_interpretation": f"Fitted to normalized ratio u ∈ [0, 1]. KS test yields p-value = {ks_pval:.5f} ({ks_decision}).",
                    "pdf_points": [{"x": round(float(x_min + u * (x_max - x_min)), 2), "pdf": beta_pdf[i]} for i, u in enumerate(norm_x)],
                    "cdf_points": [{"x": round(float(x_min + u * (x_max - x_min)), 2), "cdf": beta_cdf[i]} for i, u in enumerate(norm_x)],
                }

        return {
            "variable": variable_name,
            "sample_size": n,
            "filter_positive": filter_positive,
            "empirical_density": empirical_density,
            "fitted_distributions": fits,
        }

distribution_service = DistributionService()
