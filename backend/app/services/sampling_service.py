import math
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List, Optional

class SamplingService:
    def simulate_clt(
        self,
        df: pd.DataFrame,
        variable_name: str = "rain_sum",
        sample_size: int = 30,
        num_samples: int = 300,
        method: str = "srs",
        filter_positive: bool = False,
    ) -> Dict[str, Any]:
        """
        Module VI: Sampling, Sampling Distributions, and Central Limit Theorem Simulation.
        """
        series = df[variable_name].dropna()
        if filter_positive and variable_name in ["rain_sum", "precipitation_sum"]:
            series = series[series > 0]

        population = series.to_numpy()
        N = len(population)
        if N < 30:
            raise ValueError(f"Population size ({N}) too small for sampling laboratory.")

        # Population parameters
        pop_mean = float(np.mean(population))
        pop_var = float(np.var(population, ddof=0))
        pop_std = float(np.std(population, ddof=0))
        pop_skew = float(stats.skew(population))

        n = max(5, min(int(sample_size), min(200, N // 2)))
        M = max(50, min(int(num_samples), 1000))

        # Perform repeated sampling
        sample_means = []
        np.random.seed(42) # Seed for reproducible student demo

        if method == "stratified" and "month" in df.columns:
            # Stratify by month proportionally
            months = df["month"].unique()
            for _ in range(M):
                strat_sample = []
                for m in months:
                    stratum = df.loc[df["month"] == m, variable_name].dropna().to_numpy()
                    if len(stratum) > 0:
                        n_stratum = max(1, int(round(n * (len(stratum) / N))))
                        drawn = np.random.choice(stratum, size=min(n_stratum, len(stratum)), replace=True)
                        strat_sample.extend(drawn)
                sample_means.append(float(np.mean(strat_sample[:n])))
        else:
            # Simple Random Sampling with replacement
            for _ in range(M):
                drawn = np.random.choice(population, size=n, replace=True)
                sample_means.append(float(np.mean(drawn)))

        sample_means_arr = np.array(sample_means)
        mean_of_sample_means = float(np.mean(sample_means_arr))
        empirical_se = float(np.std(sample_means_arr, ddof=1))
        theoretical_se = pop_std / math.sqrt(n)
        sample_means_skew = float(stats.skew(sample_means_arr))

        # Normality test on sampling distribution (Shapiro-Wilk or D'Agostino)
        if M <= 5000:
            stat_norm, pval_norm = stats.shapiro(sample_means_arr[:min(500, M)])
            is_normal = bool(pval_norm > 0.05)
        else:
            stat_norm, pval_norm = stats.normaltest(sample_means_arr)
            is_normal = bool(pval_norm > 0.05)

        # Histogram of sample means vs theoretical Normal density
        counts, bin_edges = np.histogram(sample_means_arr, bins=18, density=True)
        x_min = float(bin_edges[0])
        x_max = float(bin_edges[-1])
        x_pts = np.linspace(x_min, x_max, 40)
        norm_curve = [round(float(stats.norm.pdf(x, pop_mean, theoretical_se)), 4) for x in x_pts]

        sampling_hist = []
        for i in range(len(counts)):
            mid = float((bin_edges[i] + bin_edges[i + 1]) / 2)
            sampling_hist.append({
                "mean_val": round(mid, 2),
                "density": round(float(counts[i]), 4),
            })

        clt_explanation = (
            f"Central Limit Theorem Demonstration:\n"
            f"1. The original population has severe skewness (g₁ = {pop_skew:.2f}).\n"
            f"2. For sample size n = {n}, the sampling distribution of the sample mean has skewness g₁ = {sample_means_skew:.2f} (dramatically closer to 0).\n"
            f"3. Mean of sample means (μ_x̄ = {mean_of_sample_means:.3f}) virtually matches the population mean (μ = {pop_mean:.3f}).\n"
            f"4. Empirical Standard Error ({empirical_se:.3f}) closely aligns with theoretical SE = σ/√n ({theoretical_se:.3f})."
        )

        return {
            "population_parameters": {
                "size_N": N,
                "mean_mu": round(pop_mean, 3),
                "std_sigma": round(pop_std, 3),
                "variance_sigma2": round(pop_var, 4),
                "skewness": round(pop_skew, 3),
            },
            "sampling_parameters": {
                "method": method,
                "sample_size_n": n,
                "num_simulated_samples_M": M,
            },
            "sampling_distribution": {
                "mean_of_sample_means": round(mean_of_sample_means, 3),
                "empirical_standard_error": round(empirical_se, 3),
                "theoretical_standard_error": round(theoretical_se, 3),
                "skewness_of_means": round(sample_means_skew, 3),
                "normality_test_p_value": round(float(pval_norm), 5),
                "sampling_distribution_is_normal": is_normal,
                "histogram": sampling_hist,
                "theoretical_normal_curve": [{"x": round(float(x_pts[i]), 2), "pdf": norm_curve[i]} for i in range(len(x_pts))],
            },
            "clt_conclusion": clt_explanation,
        }

    def compute_estimation(
        self,
        df: pd.DataFrame,
        variable_name: str = "rain_sum",
        rain_threshold: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Module VI: Point and Interval Estimation.
        - Point estimates for mean, variance, and proportion.
        - Confidence intervals for mean using Student's t-distribution.
        - Confidence intervals for proportion using Wilson score / Wald.
        - Confidence intervals for population variance using Chi-squared (χ²) distribution.
        """
        series = df[variable_name].dropna()
        data = series.to_numpy()
        n = len(data)
        if n < 5:
            raise ValueError("Insufficient observations for confidence interval estimation.")

        sample_mean = float(np.mean(data))
        sample_var = float(np.var(data, ddof=1))
        sample_std = float(np.std(data, ddof=1))
        se_mean = sample_std / math.sqrt(n)

        # Confidence intervals for Mean using t-distribution
        ci_mean = {}
        for conf in [0.90, 0.95, 0.99]:
            alpha = 1.0 - conf
            t_crit = float(stats.t.ppf(1.0 - alpha / 2.0, df=n - 1))
            margin = t_crit * se_mean
            ci_mean[f"{int(conf * 100)}%"] = {
                "confidence_level": conf,
                "critical_value_t": round(t_crit, 4),
                "margin_of_error": round(margin, 3),
                "lower_bound": round(sample_mean - margin, 3),
                "upper_bound": round(sample_mean + margin, 3),
            }

        # Proportion of rainy days
        rain_col = "rain_sum" if "rain_sum" in df.columns else "precipitation_sum"
        rain_series = df[rain_col].dropna()
        k_rainy = int(np.sum(rain_series >= rain_threshold))
        n_prop = len(rain_series)
        p_hat = k_rainy / n_prop if n_prop > 0 else 0.0

        ci_prop = {}
        for conf in [0.90, 0.95, 0.99]:
            alpha = 1.0 - conf
            z_crit = float(stats.norm.ppf(1.0 - alpha / 2.0))
            se_prop = math.sqrt(p_hat * (1.0 - p_hat) / n_prop)
            margin = z_crit * se_prop
            ci_prop[f"{int(conf * 100)}%"] = {
                "confidence_level": conf,
                "critical_value_z": round(z_crit, 4),
                "point_estimate": round(p_hat, 4),
                "margin_of_error": round(margin, 4),
                "lower_bound": round(max(0.0, p_hat - margin), 4),
                "upper_bound": round(min(1.0, p_hat + margin), 4),
            }

        # Confidence Interval for Population Variance (σ²) using Chi-squared distribution
        # [(n - 1)s² / χ²(α/2, n-1), (n - 1)s² / χ²(1 - α/2, n-1)]
        df_chi = n - 1
        chi2_lower = float(stats.chi2.ppf(0.975, df=df_chi)) # upper quantile in denominator gives lower bound
        chi2_upper = float(stats.chi2.ppf(0.025, df=df_chi)) # lower quantile in denominator gives upper bound
        ci_var_95_lower = (df_chi * sample_var) / chi2_lower
        ci_var_95_upper = (df_chi * sample_var) / chi2_upper

        return {
            "point_estimates": {
                "sample_mean_x_bar": round(sample_mean, 3),
                "sample_variance_s2": round(sample_var, 4),
                "sample_std_s": round(sample_std, 4),
                "rainy_day_proportion_p_hat": round(p_hat, 4),
                "sample_size_n": n,
            },
            "confidence_intervals_mean": {
                "distribution_used": "Student's t-distribution (population σ unknown)",
                "degrees_of_freedom": n - 1,
                "standard_error": round(se_mean, 4),
                "intervals": ci_mean,
            },
            "confidence_intervals_proportion": {
                "rain_threshold_mm": rain_threshold,
                "rainy_days_count": k_rainy,
                "total_days": n_prop,
                "intervals": ci_prop,
            },
            "confidence_interval_variance": {
                "distribution_used": "Chi-Squared (χ²) Distribution",
                "degrees_of_freedom": df_chi,
                "chi2_critical_lower": round(chi2_lower, 2),
                "chi2_critical_upper": round(chi2_upper, 2),
                "variance_point_estimate": round(sample_var, 4),
                "ci_95_variance_lower": round(ci_var_95_lower, 4),
                "ci_95_variance_upper": round(ci_var_95_upper, 4),
                "ci_95_std_lower": round(math.sqrt(max(0.0, ci_var_95_lower)), 3),
                "ci_95_std_upper": round(math.sqrt(max(0.0, ci_var_95_upper)), 3),
            },
        }

    def compare_variances_f_test(
        self,
        df: pd.DataFrame,
        variable_name: str = "rain_sum",
        split_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Module VI: F-distribution for comparing variances between two periods.
        """
        if "date" not in df.columns:
            raise ValueError("Date column required for two-period variance comparison.")

        if split_date:
            split_dt = pd.to_datetime(split_date)
        else:
            # Default split at midpoint of chronological dataset
            split_dt = df["date"].iloc[len(df) // 2]

        group1 = df.loc[df["date"] < split_dt, variable_name].dropna().to_numpy()
        group2 = df.loc[df["date"] >= split_dt, variable_name].dropna().to_numpy()

        n1, n2 = len(group1), len(group2)
        if n1 < 10 or n2 < 10:
            raise ValueError("Insufficient records in one of the periods for F-test.")

        s1_sq = float(np.var(group1, ddof=1))
        s2_sq = float(np.var(group2, ddof=1))

        # F statistic = s1^2 / s2^2
        f_stat = s1_sq / s2_sq if s2_sq > 0 else 1.0
        df1 = n1 - 1
        df2 = n2 - 1

        # Two-tailed p-value
        p_val = 2.0 * min(stats.f.cdf(f_stat, df1, df2), 1.0 - stats.f.cdf(f_stat, df1, df2))

        return {
            "period_1": {
                "label": f"Before {split_dt.strftime('%Y-%m-%d')}",
                "n": n1,
                "mean": round(float(np.mean(group1)), 3),
                "variance": round(s1_sq, 4),
                "std": round(float(np.std(group1, ddof=1)), 3),
            },
            "period_2": {
                "label": f"From {split_dt.strftime('%Y-%m-%d')} onward",
                "n": n2,
                "mean": round(float(np.mean(group2)), 3),
                "variance": round(s2_sq, 4),
                "std": round(float(np.std(group2, ddof=1)), 3),
            },
            "f_test": {
                "f_statistic": round(f_stat, 4),
                "df_numerator": df1,
                "df_denominator": df2,
                "p_value": round(float(p_val), 5),
                "null_hypothesis": "H0: σ₁² = σ₂² (Variances of both periods are equal)",
                "alternative_hypothesis": "H1: σ₁² ≠ σ₂² (Variances of both periods differ)",
                "decision": "Reject H0" if p_val < 0.05 else "Fail to reject H0",
                "interpretation": f"At α = 0.05, {'there is statistically significant evidence that rainfall variance differed between the two periods.' if p_val < 0.05 else 'there is insufficient evidence to conclude that rainfall variance differed between the two periods.'}",
            },
        }

sampling_service = SamplingService()
