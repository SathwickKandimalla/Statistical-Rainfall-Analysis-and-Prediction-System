import pandas as pd
import numpy as np
from typing import Dict, Any

class ProbabilityService:
    def analyze_events(
        self,
        df: pd.DataFrame,
        rain_threshold: float = 1.0,
        high_humidity_threshold: float = 75.0,
        high_temp_threshold: float = 35.0,
        high_wind_threshold: float = 20.0,
    ) -> Dict[str, Any]:
        """
        Module II: Probability, Conditional Probability, Bayes' Theorem,
        and Event Independence testing.
        """
        n = len(df)
        if n == 0:
            raise ValueError("Dataset is empty.")

        # Event A: Rainy day
        rain_col = "rain_sum" if "rain_sum" in df.columns else "precipitation_sum"
        mask_A = df[rain_col] >= rain_threshold
        count_A = int(mask_A.sum())
        p_A = count_A / n

        # Event B: High humidity
        hum_col = "relative_humidity_2m_mean"
        if hum_col in df.columns:
            mask_B = df[hum_col] >= high_humidity_threshold
        else:
            mask_B = pd.Series([False] * n)
        count_B = int(mask_B.sum())
        p_B = count_B / n

        # Event C: High temperature
        temp_col = "temperature_2m_mean"
        if temp_col in df.columns:
            mask_C = df[temp_col] >= high_temp_threshold
        else:
            mask_C = pd.Series([False] * n)
        count_C = int(mask_C.sum())
        p_C = count_C / n

        # 1. Joint and Union Probabilities: A and B
        mask_A_and_B = mask_A & mask_B
        count_A_and_B = int(mask_A_and_B.sum())
        p_A_and_B = count_A_and_B / n

        mask_A_or_B = mask_A | mask_B
        count_A_or_B = int(mask_A_or_B.sum())
        p_A_or_B = count_A_or_B / n

        # Axiom check: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
        theoretical_p_A_or_B = p_A + p_B - p_A_and_B
        axiom_satisfied = abs(p_A_or_B - theoretical_p_A_or_B) < 1e-6

        # 2. Conditional Probabilities
        # P(A | B) = P(A ∩ B) / P(B)
        p_A_given_B = (p_A_and_B / p_B) if p_B > 0 else 0.0
        # P(B | A) = P(A ∩ B) / P(A)
        p_B_given_A = (p_A_and_B / p_A) if p_A > 0 else 0.0

        # Complement of A: Dry day
        mask_not_A = ~mask_A
        count_not_A = int(mask_not_A.sum())
        p_not_A = count_not_A / n

        mask_B_and_not_A = mask_B & mask_not_A
        count_B_and_not_A = int(mask_B_and_not_A.sum())
        p_B_given_not_A = (count_B_and_not_A / count_not_A) if count_not_A > 0 else 0.0

        # 3. Bayes' Theorem Step-by-Step
        # P(A|B) = [ P(B|A) * P(A) ] / P(B)
        # Where P(B) = P(B|A)*P(A) + P(B|A')*P(A')
        prior_p_A = p_A
        likelihood_B_given_A = p_B_given_A
        likelihood_B_given_not_A = p_B_given_not_A
        marginal_P_B = (likelihood_B_given_A * prior_p_A) + (likelihood_B_given_not_A * p_not_A)
        posterior_p_A_given_B = (likelihood_B_given_A * prior_p_A) / marginal_P_B if marginal_P_B > 0 else 0.0

        # 4. Independence Test: P(A ∩ B) vs P(A) * P(B)
        p_A_times_p_B = p_A * p_B
        indep_diff = abs(p_A_and_B - p_A_times_p_B)
        ratio_indep = (p_A_and_B / p_A_times_p_B) if p_A_times_p_B > 0 else 1.0

        # Meteorological reasoning
        if p_A_and_B > p_A_times_p_B:
            dependence_type = "Positive Association"
            dependence_desc = f"P(Rain ∩ High Humidity) = {p_A_and_B:.4f} is significantly greater than P(Rain) × P(High Humidity) = {p_A_times_p_B:.4f}. This confirms high humidity and rainfall are positively dependent events."
        elif p_A_and_B < p_A_times_p_B:
            dependence_type = "Negative Association"
            dependence_desc = f"P(Rain ∩ High Humidity) = {p_A_and_B:.4f} is less than P(Rain) × P(High Humidity) = {p_A_times_p_B:.4f}."
        else:
            dependence_type = "Statistically Independent"
            dependence_desc = "P(Rain ∩ High Humidity) equals P(Rain) × P(High Humidity), satisfying mathematical independence."

        # Contingency table (2x2)
        contingency = {
            "rain_and_high_hum": count_A_and_B,
            "rain_and_low_hum": count_A - count_A_and_B,
            "dry_and_high_hum": count_B - count_A_and_B,
            "dry_and_low_hum": n - (count_A + count_B - count_A_and_B),
            "total": n,
        }

        return {
            "sample_size": n,
            "thresholds": {
                "rain_mm": rain_threshold,
                "high_humidity_pct": high_humidity_threshold,
                "high_temp_c": high_temp_threshold,
            },
            "events": {
                "A": {"name": f"Rainfall ≥ {rain_threshold} mm", "count": count_A, "probability": round(p_A, 4)},
                "B": {"name": f"Relative Humidity ≥ {high_humidity_threshold}%", "count": count_B, "probability": round(p_B, 4)},
                "C": {"name": f"Temperature ≥ {high_temp_threshold}°C", "count": count_C, "probability": round(p_C, 4)},
            },
            "joint_and_union": {
                "p_A_and_B": round(p_A_and_B, 4),
                "p_A_or_B": round(p_A_or_B, 4),
                "addition_rule_check": {
                    "p_A_plus_p_B_minus_intersection": round(theoretical_p_A_or_B, 4),
                    "satisfied": axiom_satisfied,
                },
            },
            "conditional": {
                "p_rain_given_high_humidity": round(p_A_given_B, 4),
                "p_high_humidity_given_rain": round(p_B_given_A, 4),
            },
            "bayes_theorem": {
                "formula": "P(Rain | High Humidity) = [P(High Humidity | Rain) × P(Rain)] / P(High Humidity)",
                "prior_p_rain": round(prior_p_A, 4),
                "prior_p_dry": round(p_not_A, 4),
                "likelihood_hum_given_rain": round(likelihood_B_given_A, 4),
                "likelihood_hum_given_dry": round(likelihood_B_given_not_A, 4),
                "marginal_p_high_hum_total_prob": round(marginal_P_B, 4),
                "posterior_p_rain_given_high_hum": round(posterior_p_A_given_B, 4),
                "matches_direct_conditional": bool(abs(p_A_given_B - posterior_p_A_given_B) < 1e-4),
            },
            "independence_test": {
                "p_A_and_B": round(p_A_and_B, 4),
                "p_A_times_p_B": round(p_A_times_p_B, 4),
                "difference": round(indep_diff, 4),
                "ratio": round(ratio_indep, 3),
                "verdict": dependence_type,
                "explanation": dependence_desc,
            },
            "contingency_table": contingency,
        }

probability_service = ProbabilityService()
