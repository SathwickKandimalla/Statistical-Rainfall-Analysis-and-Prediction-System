import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, List, Optional

class StatisticsService:
    def compute_descriptive_statistics(
        self,
        series: pd.Series,
        variable_name: str = "rain_sum",
        chebyshev_k: float = 2.0,
        n_bins: int = 15,
        filter_positive: bool = False,
    ) -> Dict[str, Any]:
        """
        Compute Module I descriptive statistics, frequency tables, ogives,
        box plot metrics, and Chebyshev's inequality.
        """
        clean_s = series.dropna()
        if filter_positive:
            clean_s = clean_s[clean_s > 0]

        n = len(clean_s)
        if n == 0:
            raise ValueError(f"No valid numeric data found for variable '{variable_name}'.")

        data_array = clean_s.to_numpy()

        # 1. Central Tendency
        mean_val = float(np.mean(data_array))
        median_val = float(np.median(data_array))
        
        # Mode
        mode_res = stats.mode(np.round(data_array, 1), keepdims=True)
        mode_val = float(mode_res.mode[0]) if len(mode_res.mode) > 0 else mean_val
        mode_count = int(mode_res.count[0]) if len(mode_res.count) > 0 else 0

        # 2. Measures of Dispersion / Variability
        min_val = float(np.min(data_array))
        max_val = float(np.max(data_array))
        range_val = max_val - min_val
        
        q1 = float(np.percentile(data_array, 25))
        q2 = median_val
        q3 = float(np.percentile(data_array, 75))
        iqr_val = q3 - q1

        # Sample variance (ddof=1) and sample standard deviation
        var_sample = float(np.var(data_array, ddof=1)) if n > 1 else 0.0
        std_sample = float(np.std(data_array, ddof=1)) if n > 1 else 0.0

        # Population variance (ddof=0)
        var_pop = float(np.var(data_array, ddof=0))
        std_pop = float(np.std(data_array, ddof=0))

        # Coefficient of variation (CV = std / mean * 100)
        cv_val = float((std_sample / mean_val * 100)) if abs(mean_val) > 1e-6 else 0.0

        # Skewness (Fisher-Pearson coefficient)
        skew_val = float(stats.skew(data_array)) if n > 2 else 0.0

        # 3. Box Plot metrics
        lower_fence = max(min_val, q1 - 1.5 * iqr_val)
        upper_fence = min(max_val, q3 + 1.5 * iqr_val)
        outliers = data_array[(data_array < lower_fence) | (data_array > upper_fence)].tolist()

        # 4. Frequency Table & Histogram
        counts, bin_edges = np.histogram(data_array, bins=n_bins)
        freq_table = []
        cum_freq = 0
        total_counts = int(np.sum(counts))

        for i in range(len(counts)):
            lower_b = float(bin_edges[i])
            upper_b = float(bin_edges[i + 1])
            cnt = int(counts[i])
            cum_freq += cnt
            rel_freq = round(cnt / total_counts, 4) if total_counts > 0 else 0.0
            cum_rel_freq = round(cum_freq / total_counts, 4) if total_counts > 0 else 0.0

            freq_table.append({
                "class_interval": f"{round(lower_b, 1)} - {round(upper_b, 1)}",
                "lower_bound": round(lower_b, 2),
                "upper_bound": round(upper_b, 2),
                "midpoint": round((lower_b + upper_b) / 2, 2),
                "frequency": cnt,
                "relative_frequency": rel_freq,
                "cumulative_frequency": cum_freq,
                "cumulative_relative_frequency": cum_rel_freq,
            })

        # 5. Ogive (Cumulative Frequency Curves)
        # Less-than ogive: upper bound vs cumulative frequency
        # More-than ogive: lower bound vs reverse cumulative frequency
        reverse_cum_freq = total_counts
        ogive_data = []
        # Starting point for less-than ogive at lowest lower_bound is 0
        ogive_data.append({
            "boundary": round(float(bin_edges[0]), 2),
            "less_than_cum_freq": 0,
            "more_than_cum_freq": total_counts,
            "less_than_pct": 0.0,
            "more_than_pct": 100.0,
        })

        running_less = 0
        for i in range(len(counts)):
            running_less += int(counts[i])
            running_more = total_counts - running_less
            ogive_data.append({
                "boundary": round(float(bin_edges[i + 1]), 2),
                "less_than_cum_freq": running_less,
                "more_than_cum_freq": max(0, running_more),
                "less_than_pct": round((running_less / total_counts) * 100, 2),
                "more_than_pct": round((max(0, running_more) / total_counts) * 100, 2),
            })

        # 6. Chebyshev's Inequality
        # P(|X - μ| < kσ) >= 1 - 1/k^2 for k > 1
        k = max(1.01, float(chebyshev_k))
        chebyshev_lower_bound = 1.0 - (1.0 / (k ** 2))
        chebyshev_min_x = max(0.0, mean_val - k * std_sample)
        chebyshev_max_x = mean_val + k * std_sample
        within_k_count = int(np.sum((data_array >= chebyshev_min_x) & (data_array <= chebyshev_max_x)))
        actual_proportion = within_k_count / n if n > 0 else 0.0
        chebyshev_satisfied = bool(actual_proportion >= (chebyshev_lower_bound - 1e-6))

        # 7. Stem-and-leaf plot (for sample sizes <= 150)
        stem_and_leaf = None
        if n <= 150:
            stem_and_leaf = self._compute_stem_and_leaf(data_array)
        else:
            stem_and_leaf = {
                "supported": False,
                "reason": f"Sample size (N={n}) is too large for readable stem-and-leaf display. Grouped frequency table provided above is the recommended standard statistical representation.",
            }

        # 8. Statistical interpretations
        interpretations = {
            "central_tendency": f"The mean {variable_name} is {mean_val:.2f} while the median is {median_val:.2f}. "
                               f"{'A positive difference (Mean > Median) confirms positive skewness (right-tailed).' if mean_val > median_val else 'Mean and median are close, indicating relative symmetry.'}",
            "variability": f"Standard deviation is {std_sample:.2f} with a Coefficient of Variation (CV) of {cv_val:.1f}%. "
                          f"{'A high CV (>100%) indicates extreme variability typical of daily precipitation.' if cv_val > 100 else 'Variability is moderate.'}",
            "skewness": f"Skewness coefficient g₁ = {skew_val:.2f}. "
                       f"{'The distribution is heavily right-skewed (as expected for rainfall where most days have zero or low rain, and few days have extreme storms).' if skew_val > 1 else 'The distribution is approximately symmetric.'}",
            "chebyshev": f"For k = {k:.1f}, Chebyshev's theorem guarantees at least {chebyshev_lower_bound * 100:.1f}% of observations lie within [{chebyshev_min_x:.2f}, {chebyshev_max_x:.2f}]. "
                         f"In our dataset, actual proportion is {actual_proportion * 100:.1f}%, confirming Chebyshev's inequality without assuming normality.",
        }

        return {
            "variable": variable_name,
            "sample_size": n,
            "filter_positive": filter_positive,
            "central_tendency": {
                "mean": round(mean_val, 3),
                "median": round(median_val, 3),
                "mode": round(mode_val, 3),
                "mode_frequency": mode_count,
            },
            "dispersion": {
                "min": round(min_val, 3),
                "max": round(max_val, 3),
                "range": round(range_val, 3),
                "q1": round(q1, 3),
                "q2": round(q2, 3),
                "q3": round(q3, 3),
                "iqr": round(iqr_val, 3),
                "variance_sample": round(var_sample, 4),
                "variance_pop": round(var_pop, 4),
                "std_sample": round(std_sample, 4),
                "std_pop": round(std_pop, 4),
                "coefficient_of_variation_pct": round(cv_val, 2),
                "skewness": round(skew_val, 3),
            },
            "box_plot": {
                "min": round(min_val, 2),
                "q1": round(q1, 2),
                "median": round(median_val, 2),
                "q3": round(q3, 2),
                "max": round(max_val, 2),
                "lower_fence": round(lower_fence, 2),
                "upper_fence": round(upper_fence, 2),
                "outlier_count": len(outliers),
                "sample_outliers": [round(x, 2) for x in sorted(outliers)[-10:]],
            },
            "frequency_table": freq_table,
            "ogive": ogive_data,
            "chebyshev": {
                "k": k,
                "theoretical_lower_bound_pct": round(chebyshev_lower_bound * 100, 2),
                "interval_min": round(chebyshev_min_x, 2),
                "interval_max": round(chebyshev_max_x, 2),
                "actual_proportion_pct": round(actual_proportion * 100, 2),
                "actual_count": within_k_count,
                "is_satisfied": chebyshev_satisfied,
            },
            "stem_and_leaf": stem_and_leaf,
            "interpretations": interpretations,
        }

    def _compute_stem_and_leaf(self, data: np.ndarray) -> Dict[str, Any]:
        """Compute stem-and-leaf plot for smaller subsets."""
        stems_dict: Dict[int, List[int]] = {}
        for val in data:
            integer_val = int(round(val))
            stem = integer_val // 10
            leaf = integer_val % 10
            if stem not in stems_dict:
                stems_dict[stem] = []
            stems_dict[stem].append(leaf)

        sorted_stems = []
        for stem in sorted(stems_dict.keys()):
            sorted_stems.append({
                "stem": stem,
                "leaves": sorted(stems_dict[stem]),
                "frequency": len(stems_dict[stem]),
            })

        return {
            "supported": True,
            "leaf_unit": 1,
            "stems": sorted_stems,
        }

    def compute_monthly_and_annual_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Compute monthly and annual summaries for rainfall and temperature."""
        if "rain_sum" not in df.columns:
            return {}

        monthly = df.groupby("month").agg(
            rain_mean=("rain_sum", "mean"),
            rain_sum=("rain_sum", "sum"),
            rain_max=("rain_sum", "max"),
            rain_std=("rain_sum", lambda x: np.std(x, ddof=1) if len(x) > 1 else 0.0),
            rainy_days=("rain_sum", lambda x: int(np.sum(x >= 1.0))),
            total_days=("rain_sum", "count"),
            temp_mean=("temperature_2m_mean", "mean") if "temperature_2m_mean" in df.columns else ("rain_sum", "mean"),
        ).reset_index()

        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly["month_name"] = monthly["month"].apply(lambda m: month_names[int(m) - 1] if 1 <= int(m) <= 12 else str(m))

        monthly_list = []
        for _, row in monthly.iterrows():
            monthly_list.append({
                "month": int(row["month"]),
                "month_name": row["month_name"],
                "rain_mean": round(float(row["rain_mean"]), 2),
                "rain_sum": round(float(row["rain_sum"]), 1),
                "rain_max": round(float(row["rain_max"]), 1),
                "rain_std": round(float(row["rain_std"]), 2),
                "rainy_days": int(row["rainy_days"]),
                "total_days": int(row["total_days"]),
                "temp_mean": round(float(row["temp_mean"]), 1) if "temp_mean" in row else None,
            })

        # Annual aggregation
        annual_list = []
        if "year" in df.columns:
            annual = df.groupby("year").agg(
                rain_sum=("rain_sum", "sum"),
                rain_mean=("rain_sum", "mean"),
                rain_max=("rain_sum", "max"),
                rainy_days=("rain_sum", lambda x: int(np.sum(x >= 1.0))),
                total_days=("rain_sum", "count"),
            ).reset_index()

            for _, row in annual.iterrows():
                annual_list.append({
                    "year": int(row["year"]),
                    "rain_sum": round(float(row["rain_sum"]), 1),
                    "rain_mean": round(float(row["rain_mean"]), 2),
                    "rain_max": round(float(row["rain_max"]), 1),
                    "rainy_days": int(row["rainy_days"]),
                    "total_days": int(row["total_days"]),
                })

        return {
            "monthly_summary": monthly_list,
            "annual_summary": annual_list,
        }

statistics_service = StatisticsService()
