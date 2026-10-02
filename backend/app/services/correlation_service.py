import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List, Optional

class CorrelationService:
    def compute_correlation_analysis(
        self,
        df: pd.DataFrame,
        variables: Optional[List[str]] = None,
        var_x: str = "relative_humidity_2m_mean",
        var_y: str = "rain_sum",
    ) -> Dict[str, Any]:
        """
        Module IX: Correlation, Covariance, Pearson vs Spearman, and Matrix Heatmap.
        """
        all_numeric = [
            c for c in df.columns
            if c not in ["date", "time", "year", "month", "day_of_year"]
            and pd.api.types.is_numeric_dtype(df[c])
        ]
        
        selected_vars = [v for v in (variables or all_numeric) if v in df.columns]
        if len(selected_vars) < 2:
            selected_vars = [c for c in ["rain_sum", "temperature_2m_mean", "relative_humidity_2m_mean", "pressure_msl_mean", "wind_speed_10m_max"] if c in df.columns]

        clean_sub = df[selected_vars].dropna()
        n = len(clean_sub)
        if n < 5:
            raise ValueError("Insufficient complete cases to compute correlation.")

        # 1. Full Correlation Matrix
        pearson_corr = clean_sub.corr(method="pearson").round(4).to_dict()
        spearman_corr = clean_sub.corr(method="spearman").round(4).to_dict()
        cov_matrix = clean_sub.cov().round(4).to_dict()

        # Format heatmap grid for easy rendering in frontend
        heatmap_data = []
        for v1 in selected_vars:
            for v2 in selected_vars:
                r_val = float(pearson_corr[v1][v2])
                s_val = float(spearman_corr[v1][v2])
                heatmap_data.append({
                    "var1": v1,
                    "var2": v2,
                    "pearson_r": r_val,
                    "spearman_rho": s_val,
                })

        # 2. Detailed Pairwise Inspection between var_x and var_y
        if var_x not in df.columns or var_y not in df.columns:
            var_x = selected_vars[0]
            var_y = selected_vars[1]

        pair_data = df[[var_x, var_y]].dropna()
        x_vals = pair_data[var_x].to_numpy()
        y_vals = pair_data[var_y].to_numpy()
        n_pair = len(x_vals)

        # Pearson r and p-value
        r_pearson, p_pearson = stats.pearsonr(x_vals, y_vals)
        # Spearman rho and p-value
        rho_spearman, p_spearman = stats.spearmanr(x_vals, y_vals)
        # Sample Covariance
        cov_val = float(np.cov(x_vals, y_vals, ddof=1)[0, 1])

        # Trend line: y = m*x + c
        if np.std(x_vals) > 1e-5:
            slope, intercept, _, _, _ = stats.linregress(x_vals, y_vals)
        else:
            slope, intercept = 0.0, float(np.mean(y_vals))

        # Strength and direction classification
        abs_r = abs(r_pearson)
        if abs_r < 0.2:
            strength = "Very Weak"
        elif abs_r < 0.4:
            strength = "Weak"
        elif abs_r < 0.7:
            strength = "Moderate"
        elif abs_r < 0.9:
            strength = "Strong"
        else:
            strength = "Very Strong"

        direction = "Positive" if r_pearson > 0 else "Negative"

        # Downsample scatter plot points for fast frontend rendering (max 100 points)
        step = max(1, n_pair // 100)
        scatter_sample = []
        for i in range(0, n_pair, step):
            xv = float(x_vals[i])
            yv = float(y_vals[i])
            scatter_sample.append({
                "x": round(xv, 2),
                "y": round(yv, 2),
                "trend_y": round(float(slope * xv + intercept), 2),
            })

        interpretation = (
            f"The Pearson correlation between {var_x} and {var_y} is r = {r_pearson:.3f} (p = {p_pearson:.4e}), "
            f"indicating a {strength.lower()} {direction.lower()} linear association. "
            f"The Spearman rank correlation is ρ = {rho_spearman:.3f}, capturing monotonic tendencies without assuming linearity. "
            f"Important: Correlation indicates statistical co-variation, NOT causal influence."
        )

        return {
            "selected_variables": selected_vars,
            "sample_size": n,
            "correlation_matrix_pearson": pearson_corr,
            "correlation_matrix_spearman": spearman_corr,
            "covariance_matrix": cov_matrix,
            "heatmap_cells": heatmap_data,
            "pairwise_analysis": {
                "var_x": var_x,
                "var_y": var_y,
                "covariance": round(cov_val, 4),
                "pearson_r": round(float(r_pearson), 4),
                "pearson_p_value": round(float(p_pearson), 6),
                "spearman_rho": round(float(rho_spearman), 4),
                "spearman_p_value": round(float(p_spearman), 6),
                "trend_slope": round(float(slope), 4),
                "trend_intercept": round(float(intercept), 4),
                "strength": strength,
                "direction": direction,
                "scatter_data": scatter_sample,
                "interpretation": interpretation,
            },
        }

correlation_service = CorrelationService()
