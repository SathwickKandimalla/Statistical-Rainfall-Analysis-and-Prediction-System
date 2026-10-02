import math
import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any

class HypothesisService:
    def test_mean_t_test(
        self,
        df: pd.DataFrame,
        variable_name: str = "rain_sum",
        reference_mean: float = 3.0,
        alpha: float = 0.05,
        alternative: str = "two-sided",
    ) -> Dict[str, Any]:
        """
        Module VII: Hypothesis Testing for Mean using One-Sample Student's t-test.
        H0: μ = μ0 vs H1: μ ≠ μ0 (or > μ0, or < μ0).
        """
        series = df[variable_name].dropna()
        data = series.to_numpy()
        n = len(data)
        if n < 3:
            raise ValueError("Insufficient data points for hypothesis test.")

        sample_mean = float(np.mean(data))
        sample_std = float(np.std(data, ddof=1))
        df_deg = n - 1
        se = sample_std / math.sqrt(n)

        # t-statistic: t = (x̄ - μ0) / (s / √n)
        t_stat = (sample_mean - reference_mean) / se if se > 0 else 0.0

        # Critical values and p-value based on alternative
        if alternative == "greater":
            # Right-tailed test
            p_val = float(1.0 - stats.t.cdf(t_stat, df=df_deg))
            t_crit = float(stats.t.ppf(1.0 - alpha, df=df_deg))
            h1_str = f"H1: μ > {reference_mean:.2f}"
            reject = bool(t_stat > t_crit and p_val <= alpha)
            rejection_region = f"t > {t_crit:.3f}"
        elif alternative == "less":
            # Left-tailed test
            p_val = float(stats.t.cdf(t_stat, df=df_deg))
            t_crit = float(stats.t.ppf(alpha, df=df_deg))
            h1_str = f"H1: μ < {reference_mean:.2f}"
            reject = bool(t_stat < t_crit and p_val <= alpha)
            rejection_region = f"t < {t_crit:.3f}"
        else:
            # Two-sided test (default)
            p_val = float(2.0 * (1.0 - stats.t.cdf(abs(t_stat), df=df_deg)))
            t_crit = float(stats.t.ppf(1.0 - alpha / 2.0, df=df_deg))
            h1_str = f"H1: μ ≠ {reference_mean:.2f}"
            reject = bool(abs(t_stat) > t_crit and p_val <= alpha)
            rejection_region = f"|t| > {t_crit:.3f} (i.e. t < -{t_crit:.3f} or t > {t_crit:.3f})"

        decision = "Reject H0" if reject else "Fail to reject H0"

        interpretation = (
            f"At significance level α = {alpha:.2f}, the calculated test statistic t = {t_stat:.3f} "
            f"yields a p-value of {p_val:.5f}. Since p-value {'≤' if reject else '>'} α, we "
            f"{'reject the null hypothesis in favor of the alternative.' if reject else 'fail to reject the null hypothesis. There is insufficient statistical evidence to conclude that the true mean differs from ' + str(reference_mean) + '.'}"
        )

        return {
            "variable": variable_name,
            "sample_size_n": n,
            "sample_mean_x_bar": round(sample_mean, 3),
            "sample_std_s": round(sample_std, 3),
            "standard_error_SE": round(se, 4),
            "reference_mean_mu0": round(reference_mean, 3),
            "hypotheses": {
                "null": f"H0: μ = {reference_mean:.2f}",
                "alternative": h1_str,
            },
            "test_details": {
                "test_name": "One-Sample Student's t-test",
                "test_statistic_t": round(t_stat, 4),
                "degrees_of_freedom": df_deg,
                "significance_level_alpha": alpha,
                "p_value": round(p_val, 5),
                "critical_value": round(t_crit, 4),
                "rejection_region": rejection_region,
            },
            "decision": decision,
            "interpretation": interpretation,
            "errors_educational": {
                "type_I_error": f"Type I error probability α = {alpha} (probability of concluding the mean rainfall differs from {reference_mean} when it actually does not).",
                "type_II_error": "Type II error (β) occurs if the null hypothesis is false, but our sample fails to detect the true deviation.",
                "scientific_note": "A high p-value does NOT prove the null hypothesis is true; it merely indicates the observed sample data is consistent with H0 under random sampling variation.",
            }
        }

    def test_proportion_z_test(
        self,
        df: pd.DataFrame,
        rain_threshold: float = 1.0,
        reference_prop: float = 0.25,
        alpha: float = 0.05,
        alternative: str = "two-sided",
    ) -> Dict[str, Any]:
        """
        Module VIII: Hypothesis Testing for Proportions using One-Sample Z-test.
        H0: p = p0 vs H1: p ≠ p0 (or > p0, or < p0).
        """
        rain_col = "rain_sum" if "rain_sum" in df.columns else "precipitation_sum"
        series = df[rain_col].dropna()
        n = len(series)
        if n < 10:
            raise ValueError("Insufficient data points for proportion test.")

        k_success = int(np.sum(series >= rain_threshold))
        p_hat = k_success / n
        p0 = reference_prop

        # Standard error under H0: SE = sqrt(p0 * (1 - p0) / n)
        se0 = math.sqrt(p0 * (1.0 - p0) / n) if 0 < p0 < 1 else 1e-4
        z_stat = (p_hat - p0) / se0

        if alternative == "greater":
            p_val = float(1.0 - stats.norm.cdf(z_stat))
            z_crit = float(stats.norm.ppf(1.0 - alpha))
            h1_str = f"H1: p > {p0:.3f}"
            reject = bool(z_stat > z_crit and p_val <= alpha)
            rejection_region = f"z > {z_crit:.3f}"
        elif alternative == "less":
            p_val = float(stats.norm.cdf(z_stat))
            z_crit = float(stats.norm.ppf(alpha))
            h1_str = f"H1: p < {p0:.3f}"
            reject = bool(z_stat < z_crit and p_val <= alpha)
            rejection_region = f"z < {z_crit:.3f}"
        else:
            p_val = float(2.0 * (1.0 - stats.norm.cdf(abs(z_stat))))
            z_crit = float(stats.norm.ppf(1.0 - alpha / 2.0))
            h1_str = f"H1: p ≠ {p0:.3f}"
            reject = bool(abs(z_stat) > z_crit and p_val <= alpha)
            rejection_region = f"|z| > {z_crit:.3f}"

        decision = "Reject H0" if reject else "Fail to reject H0"

        interpretation = (
            f"At significance level α = {alpha:.2f}, the calculated test statistic z = {z_stat:.3f} "
            f"with p-value = {p_val:.5f}. We {decision.lower()}."
        )

        return {
            "threshold_rain_mm": rain_threshold,
            "sample_size_n": n,
            "rainy_days_count": k_success,
            "sample_proportion_p_hat": round(p_hat, 4),
            "reference_proportion_p0": round(p0, 4),
            "standard_error_under_H0": round(se0, 4),
            "hypotheses": {
                "null": f"H0: p = {p0:.3f}",
                "alternative": h1_str,
            },
            "test_details": {
                "test_name": "One-Sample Z-Test for Proportions",
                "test_statistic_z": round(z_stat, 4),
                "significance_level_alpha": alpha,
                "p_value": round(p_val, 5),
                "critical_value": round(z_crit, 4),
                "rejection_region": rejection_region,
            },
            "decision": decision,
            "interpretation": interpretation,
        }

hypothesis_service = HypothesisService()
