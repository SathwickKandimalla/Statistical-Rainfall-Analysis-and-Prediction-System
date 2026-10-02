import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures

class PredictionService:
    def generate_short_term_estimate(
        self,
        historical_df: pd.DataFrame,
        forecast_daily: Dict[str, Any],
        model_type: str = "multiple",
        poly_degree: int = 2,
    ) -> Dict[str, Any]:
        """
        Produce model-based future rainfall estimates using:
        Historical Data -> Trained Regression Model -> Forecast Predictor Inputs -> Model-based Rainfall Estimate.
        Includes approximate 95% Prediction Interval and transparency documentation.
        """
        target_col = "rain_sum" if "rain_sum" in historical_df.columns else "precipitation_sum"
        predictors = [
            "temperature_2m_mean",
            "relative_humidity_2m_mean",
            "pressure_msl_mean",
            "wind_speed_10m_max",
        ]
        available_predictors = [p for p in predictors if p in historical_df.columns]
        if not available_predictors:
            raise ValueError("No matching predictor variables between historical data and forecast inputs.")

        clean_hist = historical_df[available_predictors + [target_col]].dropna()
        n = len(clean_hist)
        if n < 15:
            raise ValueError(f"Insufficient historical data ({n} rows) to train prediction model.")

        X_hist = clean_hist[available_predictors].to_numpy()
        y_hist = clean_hist[target_col].to_numpy()

        # Fit model
        if model_type == "polynomial":
            poly = PolynomialFeatures(degree=poly_degree, include_bias=False)
            X_hist_trans = poly.fit_transform(X_hist)
            model = LinearRegression()
            model.fit(X_hist_trans, y_hist)
            preds_hist = model.predict(X_hist_trans)
            p_features = X_hist_trans.shape[1]
        else:
            poly = None
            model = LinearRegression()
            model.fit(X_hist, y_hist)
            preds_hist = model.predict(X_hist)
            p_features = len(available_predictors)

        # Estimate residual standard error: s_e = sqrt(SSE / (n - p - 1))
        residuals = y_hist - preds_hist
        df_residuals = max(1, n - p_features - 1)
        se_estimate = math.sqrt(np.sum(residuals ** 2) / df_residuals)

        # Parse forecast daily inputs
        forecast_dates = forecast_daily.get("time", [])
        if not forecast_dates:
            raise ValueError("Forecast daily data missing 'time' array.")

        forecast_estimates = []
        for i in range(len(forecast_dates)):
            date_str = forecast_dates[i]
            x_row = []
            valid_row = True
            row_dict = {}

            for pred_var in available_predictors:
                val_list = forecast_daily.get(pred_var, [])
                if i < len(val_list) and val_list[i] is not None:
                    v = float(val_list[i])
                    x_row.append(v)
                    row_dict[pred_var] = round(v, 1)
                else:
                    valid_row = False
                    break

            if not valid_row:
                continue

            x_input = np.array([x_row])
            if poly is not None:
                x_input_trans = poly.transform(x_input)
                raw_prediction = float(model.predict(x_input_trans)[0])
            else:
                raw_prediction = float(model.predict(x_input)[0])

            # PHYSICAL CONSTRAINT: Non-negative rainfall
            constrained_estimate = max(0.0, raw_prediction)

            # Approximate 95% Prediction Interval: estimate ± 1.96 * s_e
            margin = 1.96 * se_estimate
            lower_bound = max(0.0, raw_prediction - margin)
            upper_bound = max(0.0, raw_prediction + margin)

            # Note official forecast rain_sum if provided in forecast response
            official_forecast_rain = None
            if "rain_sum" in forecast_daily and i < len(forecast_daily["rain_sum"]):
                official_forecast_rain = forecast_daily["rain_sum"][i]

            forecast_estimates.append({
                "date": date_str,
                "input_predictors": row_dict,
                "raw_regression_prediction_mm": round(raw_prediction, 2),
                "model_rainfall_estimate_mm": round(constrained_estimate, 2),
                "prediction_interval_95": {
                    "lower_bound_mm": round(lower_bound, 2),
                    "upper_bound_mm": round(upper_bound, 2),
                    "margin_mm": round(margin, 2),
                },
                "official_weather_forecast_reference_mm": round(float(official_forecast_rain), 2) if official_forecast_rain is not None else None,
            })

        return {
            "model_type_used": model_type,
            "trained_sample_size": n,
            "residual_standard_error_se": round(se_estimate, 3),
            "predictors_used": available_predictors,
            "daily_estimates": forecast_estimates,
            "transparency_notice": {
                "source_designation": "MODEL-BASED STATISTICAL ESTIMATE",
                "is_official_forecast": False,
                "clarification": (
                    "This estimate is generated by this project's trained statistical regression model. "
                    "External Open-Meteo forecast data was utilized solely as input variables (e.g. predicted temperature, relative humidity, pressure, and wind speed). "
                    "This output does not represent an official meteorological agency warning or forecast."
                ),
                "prediction_interval_meaning": (
                    "A 95% prediction interval indicates that, under the model's assumptions, "
                    "an individual future day's actual rainfall is expected to fall within [lower, upper] with approximately 95% confidence."
                ),
            },
        }

prediction_service = PredictionService()
