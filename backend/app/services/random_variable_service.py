import numpy as np
import pandas as pd
from typing import Dict, Any, List

class RandomVariableService:
    def analyze_random_variables(
        self,
        df: pd.DataFrame,
        rain_col: str = "rain_sum",
    ) -> Dict[str, Any]:
        """
        Module III: Random Variables (Discrete vs Continuous, PMF, PDF, ECDF,
        Expected Value, Variance, Standard Deviation).
        """
        if rain_col not in df.columns:
            rain_col = "precipitation_sum" if "precipitation_sum" in df.columns else df.columns[1]

        data = df[rain_col].dropna().to_numpy()
        n = len(data)
        if n == 0:
            raise ValueError("No data available for random variable analysis.")

        # 1. Continuous Random Variable Analysis: X = Daily Rainfall Amount (mm)
        mean_cont = float(np.mean(data))
        var_cont = float(np.var(data, ddof=1)) if n > 1 else 0.0
        std_cont = float(np.std(data, ddof=1)) if n > 1 else 0.0

        # Empirical Cumulative Distribution Function (ECDF)
        # Sample 50 points evenly across sorted data for clean chart transmission
        sorted_data = np.sort(data)
        indices = np.linspace(0, n - 1, min(60, n), dtype=int)
        ecdf_points = []
        for idx in indices:
            val = float(sorted_data[idx])
            ecdf_val = float((idx + 1) / n)
            ecdf_points.append({
                "x_mm": round(val, 2),
                "ecdf": round(ecdf_val, 4),
                "percentile": round(ecdf_val * 100, 2),
            })

        # 2. Discrete Random Variable Analysis: Y = Rainfall Intensity Category
        # Categories aligned with standard meteorological classifications
        categories = [
            {"name": "No Rain (< 0.1 mm)", "min": -1.0, "max": 0.1, "code": 0},
            {"name": "Light Rain (0.1 - 7.5 mm)", "min": 0.1, "max": 7.5, "code": 1},
            {"name": "Moderate Rain (7.6 - 35.5 mm)", "min": 7.5, "max": 35.5, "code": 2},
            {"name": "Heavy Rain (35.6 - 64.4 mm)", "min": 35.5, "max": 64.4, "code": 3},
            {"name": "Very Heavy Rain (≥ 64.5 mm)", "min": 64.4, "max": 1e9, "code": 4},
        ]

        pmf_list = []
        cum_p = 0.0
        e_y = 0.0
        e_y2 = 0.0

        for cat in categories:
            mask = (data > cat["min"]) & (data <= cat["max"])
            count = int(np.sum(mask))
            prob = count / n
            cum_p += prob
            code = cat["code"]
            e_y += code * prob
            e_y2 += (code ** 2) * prob

            pmf_list.append({
                "category": cat["name"],
                "code": code,
                "count": count,
                "probability_pmf": round(prob, 4),
                "cumulative_prob_cdf": round(min(1.0, cum_p), 4),
            })

        var_y = e_y2 - (e_y ** 2)
        std_y = np.sqrt(max(0.0, var_y))

        # 3. Discrete Random Variable: W = Number of Rainy Days per Week
        # Group by 7-day intervals
        df_copy = df.copy()
        df_copy["week_id"] = np.arange(len(df_copy)) // 7
        weekly_counts = df_copy.groupby("week_id")[rain_col].apply(lambda s: int(np.sum(s >= 1.0))).values
        n_weeks = len(weekly_counts)
        weekly_pmf = []
        if n_weeks > 0:
            for k in range(8): # 0 to 7 rainy days in a week
                cnt = int(np.sum(weekly_counts == k))
                weekly_pmf.append({
                    "k_days": k,
                    "frequency": cnt,
                    "probability": round(cnt / n_weeks, 4),
                })

        return {
            "sample_size": n,
            "continuous_variable": {
                "name": f"Daily Rainfall Amount (mm) [{rain_col}]",
                "type": "Continuous Random Variable",
                "domain": "X ∈ [0, ∞)",
                "expected_value_E_X": round(mean_cont, 3),
                "variance_Var_X": round(var_cont, 4),
                "std_deviation_SD_X": round(std_cont, 4),
                "ecdf": ecdf_points,
                "interpretation": f"E[X] = {mean_cont:.2f} mm represents the long-term expected daily rainfall. "
                                 f"Because Var(X) = {var_cont:.2f} is large relative to E[X], the probability distribution has high dispersion with a heavy right tail.",
            },
            "discrete_categorical_variable": {
                "name": "Rainfall Intensity Class (Y)",
                "type": "Discrete Random Variable",
                "pmf": pmf_list,
                "expected_value_E_Y": round(e_y, 3),
                "variance_Var_Y": round(var_y, 4),
                "std_deviation_SD_Y": round(std_y, 4),
                "formula_E_Y": "E[Y] = ∑ y_i · P(Y = y_i)",
                "formula_Var_Y": "Var(Y) = E[Y²] - (E[Y])²",
            },
            "discrete_weekly_count": {
                "name": "Weekly Rainy Days (W)",
                "type": "Discrete Random Variable (0 ≤ W ≤ 7)",
                "total_weeks": n_weeks,
                "mean_rainy_days_per_week": round(float(np.mean(weekly_counts)), 2) if n_weeks > 0 else 0.0,
                "variance_rainy_days": round(float(np.var(weekly_counts, ddof=1)), 3) if n_weeks > 1 else 0.0,
                "pmf": weekly_pmf,
            },
        }

random_variable_service = RandomVariableService()
