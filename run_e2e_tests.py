import sys
import httpx
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000/api"
results = {}

def log_section(title):
    print(f"\n{'='*60}\n{title}\n{'='*60}")

# ----------------------------------------------------
# PHASE 2: Location Search
# ----------------------------------------------------
log_section("PHASE 2: LOCATION SEARCH")
try:
    # 1. Search Hyderabad
    res = httpx.get(f"{BASE_URL}/location/search?query=Hyderabad", timeout=15.0)
    assert res.status_code == 200, f"Status code {res.status_code}"
    geo_data = res.json().get("results", [])
    assert len(geo_data) > 0, "No results found for Hyderabad"
    hyd = geo_data[0]
    print(f"[PASS] Hyderabad Geocoding: {hyd['name']}, {hyd.get('admin1')}, {hyd.get('country')}")
    print(f"       Coordinates: {hyd['latitude']}°N, {hyd['longitude']}°E | Timezone: {hyd['timezone']}")
    
    # 2. Search alternative location (Bengaluru)
    res_b = httpx.get(f"{BASE_URL}/location/search?query=Bengaluru", timeout=15.0)
    assert res_b.status_code == 200, f"Status code {res_b.status_code}"
    geo_b = res_b.json().get("results", [])
    assert len(geo_b) > 0, "No results found for Bengaluru"
    bgl = geo_b[0]
    print(f"[PASS] Secondary Geocoding (Bengaluru): {bgl['name']}, {bgl.get('country')} ({bgl['latitude']}°N, {bgl['longitude']}°E)")
    
    results["location_search"] = {"status": "PASS", "tested": ["Hyderabad", "Bengaluru"]}
except Exception as e:
    print(f"[FAIL] Location search error: {e}")
    results["location_search"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 3 & 4: Historical Weather & Data Validation
# ----------------------------------------------------
log_section("PHASE 3 & 4: HISTORICAL WEATHER & DATA QUALITY AUDIT")
try:
    lat = hyd['latitude']
    lon = hyd['longitude']
    tz = hyd['timezone']
    start_date = "2023-01-01"
    end_date = "2023-12-31"

    url = f"{BASE_URL}/weather/historical?latitude={lat}&longitude={lon}&start_date={start_date}&end_date={end_date}&timezone={tz}"
    res = httpx.get(url, timeout=30.0)
    assert res.status_code == 200, f"Historical API failed with status {res.status_code}: {res.text}"
    hist_data = res.json()
    
    total_records = hist_data.get("total_records")
    quality = hist_data.get("quality_report", {})
    records = hist_data.get("records", [])
    dataset_key = hist_data.get("dataset_key")

    assert total_records == 365, f"Expected 365 records for year 2023, got {total_records}"
    assert quality.get("date_continuity") is True, "Date continuity check failed"
    assert quality.get("duplicate_dates_removed") == 0, "Unexpected duplicate dates"
    assert quality.get("rainy_days") is not None, "Missing rainy day count"
    assert quality.get("dry_days") is not None, "Missing dry day count"
    assert quality.get("overall_missing_percentage") is not None, "Missing missing-percentage metric"

    print(f"[PASS] Fetched 365 daily observations for Hyderabad (ERA5 Reanalysis)")
    print(f"       Date range: {quality.get('min_date')} to {quality.get('max_date')}")
    print(f"       Rainy days (>=1.0mm): {quality.get('rainy_days')} ({quality.get('rainy_day_percentage')}%) | Dry days: {quality.get('dry_days')}")
    print(f"       Date continuity: {quality.get('date_continuity')} | Missing %: {quality.get('overall_missing_percentage')}%")
    print(f"       Variables available: {list(records[0].keys())}")
    
    results["historical_weather"] = {"status": "PASS", "records": total_records, "key": dataset_key}
    results["data_validation"] = {"status": "PASS", "quality": quality}
except Exception as e:
    print(f"[FAIL] Historical data/validation error: {e}")
    results["historical_weather"] = {"status": "FAIL", "error": str(e)}
    results["data_validation"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 5: Descriptive Statistics (Module I)
# ----------------------------------------------------
log_section("PHASE 5: DESCRIPTIVE STATISTICS (MODULE I)")
try:
    desc_payload = {
        "dataset_key": dataset_key,
        "variable": "rain_sum",
        "bins": 12,
        "chebyshev_k": 2.0,
        "filter_positive": False
    }
    res = httpx.post(f"{BASE_URL}/analysis/descriptive", json=desc_payload)
    assert res.status_code == 200, f"Descriptive stats failed: {res.text}"
    stats_data = res.json()

    ct = stats_data.get("central_tendency", {})
    disp = stats_data.get("dispersion", {})
    cheb = stats_data.get("chebyshev", {})
    freq = stats_data.get("frequency_table", [])
    ogive = stats_data.get("ogive", [])

    print(f"[PASS] Central Tendency: Mean={ct.get('mean')} mm, Median={ct.get('median')} mm, Mode={ct.get('mode')} mm")
    print(f"[PASS] Dispersion: Range={disp.get('range')} mm, Variance={disp.get('variance_sample')}, SD={disp.get('std_sample')} mm, Skewness={disp.get('skewness')}")
    print(f"[PASS] Chebyshev's Inequality (k=2.0): Theoretical Lower Bound >= {cheb.get('theoretical_lower_bound_pct')}%")
    print(f"       Actual proportion within 2 SDs: {cheb.get('actual_proportion_pct')}% (Satisfied: {cheb.get('is_satisfied')})")
    print(f"[PASS] Frequency Distribution: {len(freq)} intervals | Cumulative Ogive Points: {len(ogive)}")
    
    assert cheb.get("is_satisfied") is True, "Chebyshev theorem violation detected"
    results["descriptive_statistics"] = {"status": "PASS", "mean": ct.get("mean"), "skewness": disp.get("skewness")}
except Exception as e:
    print(f"[FAIL] Descriptive statistics error: {e}")
    results["descriptive_statistics"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 6: Probability Analysis (Module II)
# ----------------------------------------------------
log_section("PHASE 6: PROBABILITY & BAYES' THEOREM (MODULE II)")
try:
    prob_payload = {
        "dataset_key": dataset_key,
        "rain_threshold": 1.0,
        "high_humidity_threshold": 75.0,
        "high_temp_threshold": 35.0,
        "high_wind_threshold": 15.0
    }
    res = httpx.post(f"{BASE_URL}/analysis/probability", json=prob_payload)
    assert res.status_code == 200, f"Probability analysis failed: {res.text}"
    prob_data = res.json()

    events = prob_data.get("events", {})
    joint = prob_data.get("joint_and_union", {})
    cond = prob_data.get("conditional", {})
    bayes = prob_data.get("bayes_theorem", {})
    indep = prob_data.get("independence_test", {})

    print(f"[PASS] P(Rain >= 1mm) [Event A] = {events.get('A', {}).get('probability')}")
    print(f"[PASS] P(High Humidity >= 75%) [Event B] = {events.get('B', {}).get('probability')}")
    print(f"[PASS] Joint P(A ∩ B) = {joint.get('p_A_and_B')} | Union P(A ∪ B) = {joint.get('p_A_or_B')}")
    print(f"[PASS] Conditional P(Rain | High Humidity) = {cond.get('p_rain_given_high_humidity')}")
    print(f"[PASS] Bayes' Posterior P(Rain | High Humidity) = {bayes.get('posterior_p_rain_given_high_hum')}")
    print(f"[PASS] Direct Conditional == Bayes Posterior: {bayes.get('matches_direct_conditional')}")
    print(f"[PASS] Event Independence Test: |P(A∩B) - P(A)P(B)| = {indep.get('difference')} -> Verdict: {indep.get('verdict')}")
    
    assert bayes.get("matches_direct_conditional") is True, "Bayes identity mismatch"
    results["probability_analysis"] = {"status": "PASS", "bayes_posterior": bayes.get("posterior_p_rain_given_high_hum")}
except Exception as e:
    print(f"[FAIL] Probability analysis error: {e}")
    results["probability_analysis"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 7: Random Variables & Distributions (Modules III, IV, V)
# ----------------------------------------------------
log_section("PHASE 7: RANDOM VARIABLES & DISTRIBUTIONS (MODULES III, IV, V)")
try:
    # Module III: Random Variables
    res_rv = httpx.post(f"{BASE_URL}/analysis/random-variables", json={"dataset_key": dataset_key, "variable": "rain_sum"})
    assert res_rv.status_code == 200, f"Random variables failed: {res_rv.text}"
    rv_data = res_rv.json()
    cont_var = rv_data.get("continuous_variable", {})
    disc_var = rv_data.get("discrete_categorical_variable", {})
    print(f"[PASS] Continuous Random Variable: E[X]={cont_var.get('expected_value_E_X')} mm, Var(X)={cont_var.get('variance_Var_X')}")
    print(f"[PASS] Discrete Intensity Classes (PMF): {len(disc_var.get('pmf', []))} classes | E[Y]={disc_var.get('expected_value_E_Y')}")

    # Module IV: Discrete Distributions
    res_disc = httpx.post(f"{BASE_URL}/analysis/discrete-distributions", json={"dataset_key": dataset_key, "n_days": 14, "rain_threshold": 1.0})
    assert res_disc.status_code == 200, f"Discrete distributions failed: {res_disc.text}"
    disc_data = res_disc.json()
    bin_info = disc_data.get("binomial", {})
    poi_info = disc_data.get("poisson", {})
    print(f"[PASS] Binomial (n={bin_info.get('n_trials')}): Mean np={bin_info.get('mean_np')}, Var={bin_info.get('variance_npq')}")
    print(f"[PASS] Poisson: Lambda={poi_info.get('estimated_lambda')}, Mean={poi_info.get('observed_mean')}, Variance={poi_info.get('observed_variance')} | Assessment: {str(poi_info.get('dispersion_evaluation', ''))[:70]}...")

    # Module V: Continuous Distributions Fitting
    res_cont = httpx.post(f"{BASE_URL}/analysis/continuous-distributions", json={
        "dataset_key": dataset_key,
        "variable": "rain_sum",
        "filter_positive": True,
        "distributions": ["gamma", "exponential", "normal", "uniform", "beta"]
    })
    assert res_cont.status_code == 200, f"Continuous distributions failed: {res_cont.text}"
    cont_data = res_cont.json()
    fits = cont_data.get("fitted_distributions", {})
    for dist_name, fit_info in fits.items():
        ks_p = fit_info.get("ks_p_value")
        suit = fit_info.get("scientific_suitability", "")
        print(f"[PASS] Fitted {dist_name.capitalize()}: KS p-value={ks_p} | Assessment: {str(suit)[:60]}...")

    results["random_variables_and_distributions"] = {"status": "PASS", "distributions_tested": list(fits.keys())}
except Exception as e:
    print(f"[FAIL] Random variables/distributions error: {e}")
    results["random_variables_and_distributions"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 8: Correlation & Covariance (Module IX)
# ----------------------------------------------------
log_section("PHASE 8: CORRELATION & COVARIANCE (MODULE IX)")
try:
    corr_payload = {
        "dataset_key": dataset_key,
        "var_x": "relative_humidity_2m_mean",
        "var_y": "rain_sum"
    }
    res = httpx.post(f"{BASE_URL}/analysis/correlation", json=corr_payload)
    assert res.status_code == 200, f"Correlation analysis failed: {res.text}"
    corr_data = res.json()

    pair = corr_data.get("pairwise_analysis", {})
    cells = corr_data.get("heatmap_cells", [])
    print(f"[PASS] Pairwise Analysis ({pair.get('var_x')} vs {pair.get('var_y')}):")
    print(f"       Pearson r: {pair.get('pearson_r')} (p-value: {pair.get('pearson_p_value')}) -> {pair.get('strength')} {pair.get('direction')}")
    print(f"       Spearman rho: {pair.get('spearman_rho')} (p-value: {pair.get('spearman_p_value')})")
    print(f"       Sample Covariance: {pair.get('covariance')}")
    print(f"[PASS] Correlation Heatmap Cells: {len(cells)} pairwise comparisons")

    results["correlation"] = {"status": "PASS", "pearson_r": pair.get("pearson_r"), "spearman_rho": pair.get("spearman_rho")}
except Exception as e:
    print(f"[FAIL] Correlation analysis error: {e}")
    results["correlation"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 9 & 11: Regression & Model Evaluation (Module X)
# ----------------------------------------------------
log_section("PHASE 9 & 11: REGRESSION & CHRONOLOGICAL EVALUATION (MODULE X)")
try:
    reg_payload = {
        "dataset_key": dataset_key,
        "model_type": "multiple",
        "target_variable": "rain_sum",
        "predictor_variables": ["relative_humidity_2m_mean", "temperature_2m_mean", "pressure_msl_mean", "wind_speed_10m_max"],
        "train_split": 0.8
    }
    res = httpx.post(f"{BASE_URL}/analysis/regression", json=reg_payload)
    assert res.status_code == 200, f"Regression training failed: {res.text}"
    reg_data = res.json()

    v_metrics = reg_data.get("validation_metrics", {})
    t_metrics = reg_data.get("train_metrics", {})
    vif = reg_data.get("vif_multicollinearity", {})
    params = reg_data.get("model_parameters", {})
    resids = reg_data.get("residual_diagnostics", {})

    print(f"[PASS] Multiple Linear Regression Model Fitted on Earlier 80% Chronological Observations")
    print(f"       Training samples: {reg_data.get('train_observations')} | Holdout test samples: {reg_data.get('test_observations')}")
    print(f"[PASS] Train Performance: R² = {t_metrics.get('r2')}, MAE = {t_metrics.get('mae_mm')} mm, RMSE = {t_metrics.get('rmse_mm')} mm")
    print(f"[PASS] Holdout Test (Validation) Performance: R² = {v_metrics.get('r2')}, MAE = {v_metrics.get('mae_mm')} mm, RMSE = {v_metrics.get('rmse_mm')} mm")
    print(f"[PASS] Model Parameters: Intercept = {params.get('intercept')}, Features = {len(params.get('coefficients', []))}")
    print(f"[PASS] Multicollinearity (VIF): {vif}")
    print(f"[PASS] Residual Analysis: Mean Residual = {resids.get('mean_residual')}, Std Residual = {resids.get('std_residual')}")

    # Model comparison across Simple, Multiple, Polynomial
    res_comp = httpx.post(f"{BASE_URL}/analysis/model-comparison", json={"dataset_key": dataset_key, "train_split": 0.8})
    assert res_comp.status_code == 200, f"Model comparison failed: {res_comp.text}"
    comp_models = res_comp.json().get("comparison_table", [])
    print(f"[PASS] Model Comparison Table Generated ({len(comp_models)} models evaluated):")
    for m in comp_models:
        print(f"       {m.get('model_id')} ({m.get('name')}): Validation R²={m.get('validation_r2')}, Validation RMSE={m.get('validation_rmse')} mm, Validation MAE={m.get('validation_mae')} mm")

    results["regression"] = {"status": "PASS", "test_r2": v_metrics.get("r2"), "test_rmse": v_metrics.get("rmse_mm")}
    results["model_evaluation"] = {"status": "PASS", "holdout_tested": True}
except Exception as e:
    print(f"[FAIL] Regression/evaluation error: {e}")
    results["regression"] = {"status": "FAIL", "error": str(e)}
    results["model_evaluation"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 10: Model-Based Short-Term Prediction
# ----------------------------------------------------
log_section("PHASE 10: MODEL-BASED RAINFALL PREDICTION (FORECAST INPUTS)")
try:
    pred_payload = {
        "dataset_key": dataset_key,
        "model_type": "multiple",
        "predictors": ["relative_humidity_2m_mean", "temperature_2m_mean", "pressure_msl_mean", "wind_speed_10m_max"],
        "forecast_days": 7,
        "latitude": lat,
        "longitude": lon,
        "timezone": tz
    }
    res = httpx.post(f"{BASE_URL}/prediction", json=pred_payload)
    assert res.status_code == 200, f"Prediction failed: {res.text}"
    pred_data = res.json()

    transparency = pred_data.get("transparency_notice", {})
    estimates = pred_data.get("daily_estimates", [])

    assert transparency.get("is_official_forecast") is False, "Violation: labeled as official forecast"
    assert "MODEL-BASED STATISTICAL ESTIMATE" in transparency.get("source_designation", ""), "Designation label missing"
    assert len(estimates) > 0, "No forecast estimates returned"

    print(f"[PASS] Source Designation: {transparency.get('source_designation')}")
    print(f"       Clarification: {transparency.get('clarification')[:110]}...")
    print(f"[PASS] Generated {len(estimates)} Daily Model Estimates (Open-Meteo Forecast Atmospheric Inputs):")
    for day in estimates[:3]:
        raw = day.get("raw_regression_prediction_mm")
        clamped = day.get("model_rainfall_estimate_mm")
        interval = day.get("prediction_interval_95", {})
        assert clamped >= 0.0, f"Negative rainfall detected: {clamped}"
        print(f"       {day.get('date')}: Raw={raw} mm -> Clamped={clamped} mm | 95% Interval: [{interval.get('lower_bound_mm')}, {interval.get('upper_bound_mm')}] mm")

    results["prediction"] = {"status": "PASS", "estimates_count": len(estimates), "transparency_verified": True}
except Exception as e:
    print(f"[FAIL] Prediction error: {e}")
    results["prediction"] = {"status": "FAIL", "error": str(e)}

# ----------------------------------------------------
# PHASE 13: Error Handling & Edge Cases
# ----------------------------------------------------
log_section("PHASE 13: ERROR HANDLING & EDGE CASES")
try:
    # 1. Invalid date range (end before start)
    res_err1 = httpx.get(f"{BASE_URL}/weather/historical?latitude=17.38&longitude=78.48&start_date=2023-12-31&end_date=2023-01-01")
    assert res_err1.status_code == 400, f"Expected 400 for end before start, got {res_err1.status_code}"
    print(f"[PASS] Invalid date range correctly rejected with HTTP 400: '{res_err1.json().get('detail')}'")

    # 2. Invalid latitude out of bounds (> 90)
    res_err2 = httpx.get(f"{BASE_URL}/weather/historical?latitude=190.0&longitude=78.48&start_date=2023-01-01&end_date=2023-01-10")
    assert res_err2.status_code == 422, f"Expected 422 for lat>90, got {res_err2.status_code}"
    print(f"[PASS] Out-of-bounds latitude correctly rejected with HTTP 422 (Pydantic validation)")

    # 3. Empty geocoding query (< 2 characters)
    res_err3 = httpx.get(f"{BASE_URL}/location/search?query=a")
    assert res_err3.status_code == 422, f"Expected 422 for single-character search, got {res_err3.status_code}"
    print(f"[PASS] Short geocoding query correctly rejected with HTTP 422")

    results["error_handling"] = {"status": "PASS"}
except Exception as e:
    print(f"[FAIL] Error handling verification failed: {e}")
    results["error_handling"] = {"status": "FAIL", "error": str(e)}

log_section("OVERALL TEST RESULTS SUMMARY")
print(json.dumps(results, indent=2))
