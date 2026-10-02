import io
import re
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List, Optional

class DataCleaningService:
    def __init__(self):
        self.column_aliases = {
            "date": ["date", "time", "day", "timestamp", "datetime"],
            "rain_sum": ["rain_sum", "rainfall", "rain", "precipitation_sum", "prcp", "rainfall_mm", "rain_mm"],
            "precipitation_sum": ["precipitation_sum", "precipitation", "precip", "total_precip"],
            "temperature_2m_mean": ["temperature_2m_mean", "temp", "temperature", "tmean", "temp_mean", "temperature_mean"],
            "temperature_2m_max": ["temperature_2m_max", "temp_max", "tmax", "max_temp"],
            "temperature_2m_min": ["temperature_2m_min", "temp_min", "tmin", "min_temp"],
            "relative_humidity_2m_mean": ["relative_humidity_2m_mean", "humidity", "rh", "relative_humidity", "humidity_mean"],
            "pressure_msl_mean": ["pressure_msl_mean", "pressure", "mslp", "pres", "sea_level_pressure"],
            "wind_speed_10m_max": ["wind_speed_10m_max", "wind", "wind_speed", "windspeed", "max_wind"],
            "precipitation_hours": ["precipitation_hours", "rain_hours", "precip_hours"],
        }

    def clean_api_daily_data(
        self,
        raw_daily: Dict[str, Any],
        rain_threshold: float = 1.0,
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Validate, clean, and structure Open-Meteo daily weather dictionary.
        Returns: (cleaned_df, quality_report)
        """
        actions_taken: List[str] = []
        if not raw_daily or "time" not in raw_daily:
            raise ValueError("Raw weather data missing 'time' field or is empty.")

        # Convert dictionary of lists to pandas DataFrame
        df = pd.DataFrame(raw_daily)
        total_raw = len(df)

        # Standardize date column
        if "time" in df.columns:
            df["date"] = pd.to_datetime(df["time"], errors="coerce")
        elif "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
        else:
            raise ValueError("No recognizable date/time column found in data.")

        # Remove rows where date parsing failed
        invalid_dates = df["date"].isna().sum()
        if invalid_dates > 0:
            df = df.dropna(subset=["date"])
            actions_taken.append(f"Dropped {invalid_dates} rows with unparseable dates.")

        # Sort chronologically
        df = df.sort_values("date").reset_index(drop=True)
        actions_taken.append("Sorted records chronologically by date.")

        # Detect duplicate dates
        duplicate_count = df.duplicated(subset=["date"]).sum()
        if duplicate_count > 0:
            df = df.drop_duplicates(subset=["date"], keep="first").reset_index(drop=True)
            actions_taken.append(f"Removed {duplicate_count} duplicate date entries.")

        # Check date continuity
        date_continuity = True
        missing_dates_count = 0
        if len(df) > 1:
            full_date_range = pd.date_range(start=df["date"].min(), end=df["date"].max(), freq="D")
            missing_dates = full_date_range.difference(df["date"])
            missing_dates_count = len(missing_dates)
            if missing_dates_count > 0:
                date_continuity = False
                actions_taken.append(f"Detected {missing_dates_count} missing date intervals in date sequence.")
            else:
                actions_taken.append("Verified complete date continuity (no gaps in daily sequence).")

        # Analyze missing values per column
        numeric_cols = [c for c in df.columns if c not in ["date", "time"]]
        missing_counts: Dict[str, int] = {}
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            n_miss = int(df[col].isna().sum())
            missing_counts[col] = n_miss

            # Handle negative rain if any (physical constraint)
            if col in ["rain_sum", "precipitation_sum", "precipitation_hours"]:
                neg_count = (df[col] < 0).sum()
                if neg_count > 0:
                    df.loc[df[col] < 0, col] = 0.0
                    actions_taken.append(f"Clamped {neg_count} negative values to 0.0 in '{col}' (rainfall physical constraint).")

            # Impute small missing gaps using linear interpolation
            if 0 < n_miss <= len(df) * 0.1: # Less than 10% missing
                df[col] = df[col].interpolate(method="linear").bfill().ffill()
                actions_taken.append(f"Imputed {n_miss} missing values in '{col}' using linear interpolation.")
            elif n_miss > len(df) * 0.1:
                actions_taken.append(f"Kept {n_miss} missing values in '{col}' (exceeds 10% interpolation threshold).")

        # Calculate rainy days vs dry days
        rain_col = "rain_sum" if "rain_sum" in df.columns else "precipitation_sum"
        if rain_col in df.columns:
            rainy_mask = df[rain_col] >= rain_threshold
            rainy_days = int(rainy_mask.sum())
            dry_days = int((~rainy_mask).sum())
            rainy_day_pct = round((rainy_days / len(df)) * 100, 2) if len(df) > 0 else 0.0
        else:
            rainy_days = 0
            dry_days = len(df)
            rainy_day_pct = 0.0

        # Derived calendar columns for grouping
        df["year"] = df["date"].dt.year
        df["month"] = df["date"].dt.month
        df["month_name"] = df["date"].dt.strftime("%b")
        df["day_of_year"] = df["date"].dt.dayofyear

        # Total missing percentage
        total_cells = len(df) * len(numeric_cols) if len(numeric_cols) > 0 else 1
        total_missing = sum(missing_counts.values())
        missing_pct = round((total_missing / total_cells) * 100, 2)

        quality_report = {
            "total_records": len(df),
            "raw_records_received": total_raw,
            "valid_records": int(df[numeric_cols].dropna().shape[0]) if numeric_cols else len(df),
            "duplicate_dates_removed": int(duplicate_count),
            "date_continuity": date_continuity,
            "missing_date_intervals": int(missing_dates_count),
            "min_date": df["date"].min().strftime("%Y-%m-%d") if len(df) > 0 else None,
            "max_date": df["date"].max().strftime("%Y-%m-%d") if len(df) > 0 else None,
            "rainy_days": rainy_days,
            "dry_days": dry_days,
            "rainy_day_percentage": rainy_day_pct,
            "rain_threshold_mm": rain_threshold,
            "missing_values_by_variable": missing_counts,
            "overall_missing_percentage": missing_pct,
            "actions_taken": actions_taken,
        }

        return df, quality_report

    def parse_uploaded_file(self, content_bytes: bytes, filename: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Parse uploaded CSV or Excel file and map columns to internal weather schema.
        """
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content_bytes))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(content_bytes))
        else:
            raise ValueError("Unsupported file format. Please upload CSV or Excel (.xlsx).")

        column_mapping: Dict[str, str] = {}
        unmapped_cols: List[str] = []

        # Normalize column names for matching
        normalized_cols = {col: re.sub(r"[^a-zA-Z0-9_]", "", col.lower().strip()) for col in df.columns}

        for target_schema, aliases in self.column_aliases.items():
            matched = False
            for orig_col, norm_col in normalized_cols.items():
                if norm_col in aliases or any(alias in norm_col for alias in aliases):
                    column_mapping[orig_col] = target_schema
                    matched = True
                    break

        for orig_col in df.columns:
            if orig_col not in column_mapping:
                unmapped_cols.append(orig_col)

        # Rename columns according to mapping
        df_mapped = df.rename(columns=column_mapping)

        # Verify essential columns
        if "date" not in df_mapped.columns:
            raise ValueError("Could not find or map a date column in uploaded file.")
        if "rain_sum" not in df_mapped.columns and "precipitation_sum" not in df_mapped.columns:
            raise ValueError("Could not find or map a rainfall/precipitation column in uploaded file.")

        cleaned_df, quality_report = self.clean_api_daily_data(df_mapped.to_dict(orient="list"))
        quality_report["uploaded_filename"] = filename
        quality_report["column_mapping"] = column_mapping
        quality_report["unmapped_columns"] = unmapped_cols

        return cleaned_df, quality_report

data_cleaning_service = DataCleaningService()
