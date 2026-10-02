import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

class RegressionService:
    def prepare_dataset(
        self,
        df: pd.DataFrame,
        target_col: str = "rain_sum",
        feature_cols: Optional[List[str]] = None,
        train_ratio: float = 0.8,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, List[str], List[str]]:
        """
        Chronologically split dataset into Train (first 80%) and Test (later 20%).
        NEVER randomly shuffle chronological time-series data.
        """
        if target_col not in df.columns:
            target_col = "precipitation_sum"

        features = feature_cols or [
            "temperature_2m_mean",
            "relative_humidity_2m_mean",
            "pressure_msl_mean",
            "wind_speed_10m_max",
        ]
        available_features = [f for f in features if f in df.columns]
        if not available_features:
            raise ValueError("None of the requested predictor features exist in the dataset.")

        # Create 1-day lag feature if enough rows exist
        df_model = df.copy().sort_values("date").reset_index(drop=True)
        if len(df_model) > 10:
            df_model["rain_lag1"] = df_model[target_col].shift(1)
            # Impute the first day lag strictly using day-0 observation itself to prevent any future/test-set data leakage
            df_model["rain_lag1"] = df_model["rain_lag1"].bfill()
            if "rain_lag1" not in available_features and len(available_features) > 1:
                available_features.append("rain_lag1")

        cols_needed = ["date", target_col] + available_features
        clean_df = df_model[cols_needed].dropna().reset_index(drop=True)

        n_total = len(clean_df)
        if n_total < 20:
            raise ValueError(f"Insufficient observations ({n_total}) for train/test regression analysis.")

        split_idx = int(n_total * train_ratio)
        train_df = clean_df.iloc[:split_idx].copy()
        test_df = clean_df.iloc[split_idx:].copy()

        warnings = []
        if len(test_df) < 5:
            warnings.append("Test set size is very small; consider extending historical date range.")

        return train_df, test_df, available_features, warnings

    def calculate_vif(self, X: pd.DataFrame) -> Dict[str, float]:
        """
        Calculate Variance Inflation Factor (VIF) to detect multicollinearity.
        VIF_j = 1 / (1 - R_j^2)
        """
        vif_dict: Dict[str, float] = {}
        cols = list(X.columns)
        if len(cols) <= 1:
            return {cols[0]: 1.0} if cols else {}

        for col in cols:
            y_v = X[col]
            X_other = X.drop(columns=[col])
            lr = LinearRegression()
            lr.fit(X_other, y_v)
            r2 = lr.score(X_other, y_v)
            vif = 1.0 / (1.0 - r2) if (1.0 - r2) > 1e-4 else 999.0
            vif_dict[col] = round(float(vif), 2)

        return vif_dict

    def train_and_evaluate(
        self,
        df: pd.DataFrame,
        model_type: str = "multiple", # "simple", "multiple", "polynomial"
        target_col: str = "rain_sum",
        feature_cols: Optional[List[str]] = None,
        train_ratio: float = 0.8,
        poly_degree: int = 2,
    ) -> Dict[str, Any]:
        """
        Module X: Fit regression model with chronological hold-out validation,
        multicollinearity diagnostics, residual analysis, and non-negative constraints.
        """
        train_df, test_df, features, warnings = self.prepare_dataset(
            df, target_col=target_col, feature_cols=feature_cols, train_ratio=train_ratio
        )

        if model_type == "simple":
            # Simple linear regression with top correlated predictor (usually humidity)
            features = ["relative_humidity_2m_mean"] if "relative_humidity_2m_mean" in features else [features[0]]

        X_train = train_df[features].to_numpy()
        y_train = train_df[target_col].to_numpy()
        X_test = test_df[features].to_numpy()
        y_test = test_df[target_col].to_numpy()

        n_train, p = X_train.shape
        n_test = len(y_test)

        # Multicollinearity check (VIF)
        vif_report = {}
        if len(features) > 1:
            vif_report = self.calculate_vif(train_df[features])
            high_vif = [f for f, v in vif_report.items() if v > 5.0]
            if high_vif:
                warnings.append(f"Moderate to high multicollinearity detected in predictors: {', '.join(high_vif)} (VIF > 5.0).")

        # Model fitting
        if model_type == "polynomial":
            poly = PolynomialFeatures(degree=poly_degree, include_bias=False)
            X_train_trans = poly.fit_transform(X_train)
            X_test_trans = poly.transform(X_test)
            poly_feature_names = poly.get_feature_names_out(features).tolist()
            model = LinearRegression()
            model.fit(X_train_trans, y_train)
            
            raw_pred_train = model.predict(X_train_trans)
            raw_pred_test = model.predict(X_test_trans)
            coeffs = model.coef_.tolist()
            feature_names_fitted = poly_feature_names
        else:
            model = LinearRegression()
            model.fit(X_train, y_train)
            raw_pred_train = model.predict(X_train)
            raw_pred_test = model.predict(X_test)
            coeffs = model.coef_.tolist()
            feature_names_fitted = features

        intercept = float(model.intercept_)

        # PHYSICAL CONSTRAINT: Rainfall cannot be negative!
        # Apply constraint: y_pred = max(0.0, raw_pred)
        pred_train = np.maximum(0.0, raw_pred_train)
        pred_test = np.maximum(0.0, raw_pred_test)

        # Train Metrics
        mae_train = float(mean_absolute_error(y_train, pred_train))
        rmse_train = float(math.sqrt(mean_squared_error(y_train, pred_train)))
        r2_train = float(r2_score(y_train, pred_train))
        adj_r2_train = 1.0 - (1.0 - r2_train) * (n_train - 1) / max(1, n_train - len(feature_names_fitted) - 1)

        # Test (Validation) Metrics
        mae_test = float(mean_absolute_error(y_test, pred_test))
        rmse_test = float(math.sqrt(mean_squared_error(y_test, pred_test)))
        r2_test = float(r2_score(y_test, pred_test))
        adj_r2_test = 1.0 - (1.0 - r2_test) * (n_test - 1) / max(1, n_test - len(feature_names_fitted) - 1)

        # Residuals on test set
        residuals = (y_test - pred_test).tolist()
        res_mean = float(np.mean(residuals))
        res_std = float(np.std(residuals, ddof=1)) if n_test > 1 else 1.0

        # Coefficients summary
        coeff_summary = []
        for name, coef in zip(feature_names_fitted, coeffs):
            coeff_summary.append({
                "feature": name,
                "coefficient": round(float(coef), 4),
                "interpretation": f"A 1-unit increase in {name} is associated with a {abs(coef):.3f} mm {'increase' if coef > 0 else 'decrease'} in expected rainfall, holding other predictors constant.",
            })

        # Test set actual vs predicted points for time-series chart (sample max 80 points)
        step = max(1, n_test // 80)
        time_series_points = []
        for i in range(0, n_test, step):
            time_series_points.append({
                "date": test_df["date"].iloc[i].strftime("%Y-%m-%d"),
                "actual": round(float(y_test[i]), 2),
                "predicted": round(float(pred_test[i]), 2),
                "raw_unconstrained": round(float(raw_pred_test[i]), 2),
                "residual": round(float(residuals[i]), 2),
            })

        # Residual vs Predicted points
        residual_plot_points = []
        for i in range(0, n_test, step):
            residual_plot_points.append({
                "predicted": round(float(pred_test[i]), 2),
                "residual": round(float(residuals[i]), 2),
            })

        # Error distribution histogram (residuals)
        counts, bin_edges = np.histogram(residuals, bins=15)
        res_histogram = []
        for i in range(len(counts)):
            res_histogram.append({
                "error_range": f"{round(float(bin_edges[i]), 1)} to {round(float(bin_edges[i + 1]), 1)}",
                "midpoint": round(float((bin_edges[i] + bin_edges[i + 1]) / 2), 2),
                "frequency": int(counts[i]),
            })

        negative_pred_count = int(np.sum(raw_pred_test < 0))
        physical_note = (
            f"Physical Non-Negativity Constraint: Ordinary linear regression produced negative raw estimates on {negative_pred_count} test days. "
            f"These raw outputs were bounded at 0.0 mm to satisfy meteorological physical constraints."
            if negative_pred_count > 0
            else "All raw regression outputs satisfied physical non-negativity."
        )

        return {
            "model_type": model_type,
            "target_variable": target_col,
            "features_used": features,
            "train_observations": n_train,
            "test_observations": n_test,
            "train_test_split_date": test_df["date"].iloc[0].strftime("%Y-%m-%d"),
            "train_metrics": {
                "r2": round(r2_train, 4),
                "adj_r2": round(adj_r2_train, 4),
                "mae_mm": round(mae_train, 3),
                "rmse_mm": round(rmse_train, 3),
            },
            "validation_metrics": {
                "r2": round(r2_test, 4),
                "adj_r2": round(adj_r2_test, 4),
                "mae_mm": round(mae_test, 3),
                "rmse_mm": round(rmse_test, 3),
                "r2_academic_explanation": (
                    "A negative R² on the chronological holdout set means that this regression model performs worse than a simple baseline that predicts the test-set mean. "
                    "This indicates that the selected linear predictors do not explain the unseen rainfall variation sufficiently well. "
                    "This is a genuine validation result reflecting zero-inflated meteorological time-series dynamics, and NOT a software error."
                    if r2_test < 0
                    else "R² represents the proportion of holdout variance explained by the regression model relative to predicting the test-set mean."
                ),
            },
            "model_parameters": {
                "intercept": round(intercept, 4),
                "coefficients": coeff_summary,
            },
            "vif_multicollinearity": vif_report,
            "assumption_warnings": warnings,
            "physical_constraint_note": physical_note,
            "residual_diagnostics": {
                "mean_residual": round(res_mean, 3),
                "std_residual": round(res_std, 3),
                "histogram": res_histogram,
                "residuals_vs_predicted": residual_plot_points,
            },
            "holdout_time_series": time_series_points,
        }

    def compare_all_models(
        self,
        df: pd.DataFrame,
        target_col: str = "rain_sum",
        train_ratio: float = 0.8,
    ) -> Dict[str, Any]:
        """
        Compare Model A (Simple Linear), Model B (Multiple Linear), and Model C (Polynomial)
        on the chronological test set.
        """
        results_a = self.train_and_evaluate(df, model_type="simple", target_col=target_col, train_ratio=train_ratio)
        results_b = self.train_and_evaluate(df, model_type="multiple", target_col=target_col, train_ratio=train_ratio)
        results_c = self.train_and_evaluate(df, model_type="polynomial", target_col=target_col, train_ratio=train_ratio, poly_degree=2)

        comparison_table = [
            {
                "model_id": "Model A",
                "name": "Simple Linear Regression",
                "predictors": "Relative Humidity",
                "validation_mae": results_a["validation_metrics"]["mae_mm"],
                "validation_rmse": results_a["validation_metrics"]["rmse_mm"],
                "validation_r2": results_a["validation_metrics"]["r2"],
                "interpretability": "High (single slope relationship)",
            },
            {
                "model_id": "Model B",
                "name": "Multiple Linear Regression",
                "predictors": "Temperature, Humidity, Pressure, Wind, Lag",
                "validation_mae": results_b["validation_metrics"]["mae_mm"],
                "validation_rmse": results_b["validation_metrics"]["rmse_mm"],
                "validation_r2": results_b["validation_metrics"]["r2"],
                "interpretability": "High (linear coefficient per atmospheric factor)",
            },
            {
                "model_id": "Model C",
                "name": "Polynomial Regression (Degree 2)",
                "predictors": "Atmospheric factors + 2nd-degree interactions",
                "validation_mae": results_c["validation_metrics"]["mae_mm"],
                "validation_rmse": results_c["validation_metrics"]["rmse_mm"],
                "validation_r2": results_c["validation_metrics"]["r2"],
                "interpretability": "Moderate (captures curvature and interaction terms)",
            },
        ]

        # Determine best model by validation RMSE
        best_model = min(comparison_table, key=lambda m: m["validation_rmse"])

        return {
            "comparison_table": comparison_table,
            "recommended_model": best_model["name"],
            "recommendation_rationale": (
                f"{best_model['name']} achieved the lowest validation RMSE ({best_model['validation_rmse']} mm) on unseen historical hold-out data. "
                f"It is selected as the primary estimation engine for short-term prediction while maintaining interpretability."
            ),
            "model_details": {
                "simple": results_a,
                "multiple": results_b,
                "polynomial": results_c,
            }
        }

regression_service = RegressionService()
