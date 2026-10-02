export interface LocationItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone: string;
  country_code?: string;
}

export interface WeatherRecord {
  date: string;
  rain_sum: number;
  precipitation_sum?: number;
  temperature_2m_mean?: number;
  temperature_2m_max?: number;
  temperature_2m_min?: number;
  relative_humidity_2m_mean?: number;
  pressure_msl_mean?: number;
  wind_speed_10m_max?: number;
  precipitation_hours?: number;
  [key: string]: any;
}

export interface DataQualityReport {
  total_records: number;
  raw_records_received: number;
  valid_records: number;
  duplicate_dates_removed: number;
  date_continuity: boolean;
  missing_date_intervals: number;
  min_date: string | null;
  max_date: string | null;
  rainy_days: number;
  dry_days: number;
  rainy_day_percentage: number;
  rain_threshold_mm: number;
  missing_values_by_variable: Record<string, number>;
  overall_missing_percentage: number;
  actions_taken: string[];
  uploaded_filename?: string;
  column_mapping?: Record<string, string>;
}

export interface HistoricalWeatherResponse {
  dataset_key: string;
  metadata: {
    data_source: string;
    latitude: number;
    longitude: number;
    start_date: string;
    end_date: string;
    timezone: string;
    retrieval_timestamp: string;
    transparency_note: string;
  };
  units: Record<string, string>;
  quality_report: DataQualityReport;
  total_records: number;
  records: WeatherRecord[];
}

export interface DescriptiveStatsResponse {
  variable: string;
  sample_size: number;
  filter_positive: boolean;
  central_tendency: {
    mean: number;
    median: number;
    mode: number;
    mode_frequency: number;
  };
  dispersion: {
    min: number;
    max: number;
    range: number;
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
    variance_sample: number;
    variance_pop: number;
    std_sample: number;
    std_pop: number;
    coefficient_of_variation_pct: number;
    skewness: number;
  };
  box_plot: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    lower_fence: number;
    upper_fence: number;
    outlier_count: number;
    sample_outliers: number[];
  };
  frequency_table: Array<{
    class_interval: string;
    lower_bound: number;
    upper_bound: number;
    midpoint: number;
    frequency: number;
    relative_frequency: number;
    cumulative_frequency: number;
    cumulative_relative_frequency: number;
  }>;
  ogive: Array<{
    boundary: number;
    less_than_cum_freq: number;
    more_than_cum_freq: number;
    less_than_pct: number;
    more_than_pct: number;
  }>;
  chebyshev: {
    k: number;
    theoretical_lower_bound_pct: number;
    interval_min: number;
    interval_max: number;
    actual_proportion_pct: number;
    actual_count: number;
    is_satisfied: boolean;
  };
  stem_and_leaf?: {
    supported: boolean;
    reason?: string;
    leaf_unit?: number;
    stems?: Array<{ stem: number; leaves: number[]; frequency: number }>;
  };
  interpretations: Record<string, string>;
  monthly_summary?: Array<{
    month: number;
    month_name: string;
    rain_mean: number;
    rain_sum: number;
    rain_max: number;
    rain_std: number;
    rainy_days: number;
    total_days: number;
    temp_mean?: number;
  }>;
  annual_summary?: Array<{
    year: number;
    rain_sum: number;
    rain_mean: number;
    rain_max: number;
    rainy_days: number;
    total_days: number;
  }>;
}

export interface ProbabilityResponse {
  sample_size: number;
  thresholds: Record<string, number>;
  events: {
    A: { name: string; count: number; probability: number };
    B: { name: string; count: number; probability: number };
    C: { name: string; count: number; probability: number };
  };
  joint_and_union: {
    p_A_and_B: number;
    p_A_or_B: number;
    addition_rule_check: {
      p_A_plus_p_B_minus_intersection: number;
      satisfied: boolean;
    };
  };
  conditional: {
    p_rain_given_high_humidity: number;
    p_high_humidity_given_rain: number;
  };
  bayes_theorem: {
    formula: string;
    prior_p_rain: number;
    prior_p_dry: number;
    likelihood_hum_given_rain: number;
    likelihood_hum_given_dry: number;
    marginal_p_high_hum_total_prob: number;
    posterior_p_rain_given_high_hum: number;
    matches_direct_conditional: boolean;
  };
  independence_test: {
    p_A_and_B: number;
    p_A_times_p_B: number;
    difference: number;
    ratio: number;
    verdict: string;
    explanation: string;
  };
  contingency_table: {
    rain_and_high_hum: number;
    rain_and_low_hum: number;
    dry_and_high_hum: number;
    dry_and_low_hum: number;
    total: number;
  };
}

export interface RandomVariablesResponse {
  sample_size: number;
  continuous_variable: {
    name: string;
    type: string;
    domain: string;
    expected_value_E_X: number;
    variance_Var_X: number;
    std_deviation_SD_X: number;
    ecdf: Array<{ x_mm: number; ecdf: number; percentile: number }>;
    interpretation: string;
  };
  discrete_categorical_variable: {
    name: string;
    type: string;
    pmf: Array<{
      category: string;
      code: number;
      count: number;
      probability_pmf: number;
      cumulative_prob_cdf: number;
    }>;
    expected_value_E_Y: number;
    variance_Var_Y: number;
    std_deviation_SD_Y: number;
    formula_E_Y: string;
    formula_Var_Y: string;
  };
  discrete_weekly_count: {
    name: string;
    type: string;
    total_weeks: number;
    mean_rainy_days_per_week: number;
    variance_rainy_days: number;
    pmf: Array<{ k_days: number; frequency: number; probability: number }>;
  };
}

export interface DiscreteDistributionsResponse {
  binomial: {
    interpretation: string;
    n_trials: number;
    p_success: number;
    mean_np: number;
    variance_npq: number;
    std_dev: number;
    pmf_distribution: Array<{ k: number; probability: number; cumulative_prob: number }>;
  };
  poisson: {
    interpretation: string;
    estimated_lambda: number;
    observed_mean: number;
    observed_variance: number;
    dispersion_ratio: number;
    dispersion_evaluation: string;
    pmf_distribution: Array<{ k: number; probability: number; cumulative_prob: number }>;
  };
  binomial_to_poisson: {
    description: string;
    rule_of_thumb_satisfied: boolean;
    rule_of_thumb_explanation: string;
    comparison: Array<{
      k: number;
      binomial_p: number;
      poisson_approx_p: number;
      absolute_difference: number;
    }>;
  };
  moment_generating_functions: Record<string, {
    formula: string;
    derivation_mean: string;
    derivation_variance: string;
    interpretation: string;
  }>;
}

export interface ContinuousDistributionsResponse {
  variable: string;
  sample_size: number;
  filter_positive: boolean;
  empirical_density: Array<{ x: number; density: number }>;
  fitted_distributions: Record<string, {
    name: string;
    parameters: Record<string, number>;
    mean?: number;
    mean_normalized?: number;
    variance?: number;
    variance_normalized?: number;
    ks_statistic: number;
    ks_p_value: number;
    scientific_suitability: string;
    pdf_points: Array<{ x: number; pdf: number }>;
    cdf_points: Array<{ x: number; cdf: number }>;
  }>;
}

export interface SamplingResponse {
  population_parameters: {
    size_N: number;
    mean_mu: number;
    std_sigma: number;
    variance_sigma2: number;
    skewness: number;
  };
  sampling_parameters: {
    method: string;
    sample_size_n: number;
    num_simulated_samples_M: number;
  };
  sampling_distribution: {
    mean_of_sample_means: number;
    empirical_standard_error: number;
    theoretical_standard_error: number;
    skewness_of_means: number;
    normality_test_p_value: number;
    sampling_distribution_is_normal: boolean;
    histogram: Array<{ mean_val: number; density: number }>;
    theoretical_normal_curve: Array<{ x: number; pdf: number }>;
  };
  clt_conclusion: string;
}

export interface EstimationResponse {
  point_estimates: {
    sample_mean_x_bar: number;
    sample_variance_s2: number;
    sample_std_s: number;
    rainy_day_proportion_p_hat: number;
    sample_size_n: number;
  };
  confidence_intervals_mean: {
    distribution_used: string;
    degrees_of_freedom: number;
    standard_error: number;
    intervals: Record<string, {
      confidence_level: number;
      critical_value_t: number;
      margin_of_error: number;
      lower_bound: number;
      upper_bound: number;
    }>;
  };
  confidence_intervals_proportion: {
    rain_threshold_mm: number;
    rainy_days_count: number;
    total_days: number;
    intervals: Record<string, {
      confidence_level: number;
      critical_value_z: number;
      point_estimate: number;
      margin_of_error: number;
      lower_bound: number;
      upper_bound: number;
    }>;
  };
  confidence_interval_variance: {
    distribution_used: string;
    degrees_of_freedom: number;
    chi2_critical_lower: number;
    chi2_critical_upper: number;
    variance_point_estimate: number;
    ci_95_variance_lower: number;
    ci_95_variance_upper: number;
    ci_95_std_lower: number;
    ci_95_std_upper: number;
  };
}

export interface VarianceComparisonResponse {
  period_1: {
    label: string;
    n: number;
    mean: number;
    variance: number;
    std: number;
  };
  period_2: {
    label: string;
    n: number;
    mean: number;
    variance: number;
    std: number;
  };
  f_test: {
    f_statistic: number;
    df_numerator: number;
    df_denominator: number;
    p_value: number;
    null_hypothesis: string;
    alternative_hypothesis: string;
    decision: string;
    interpretation: string;
  };
}

export interface HypothesisMeanResponse {
  variable: string;
  sample_size_n: number;
  sample_mean_x_bar: number;
  sample_std_s: number;
  standard_error_SE: number;
  reference_mean_mu0: number;
  hypotheses: {
    null: string;
    alternative: string;
  };
  test_details: {
    test_name: string;
    test_statistic_t: number;
    degrees_of_freedom: number;
    significance_level_alpha: number;
    p_value: number;
    critical_value: number;
    rejection_region: string;
  };
  decision: string;
  interpretation: string;
  errors_educational: {
    type_I_error: string;
    type_II_error: string;
    scientific_note: string;
  };
}

export interface HypothesisPropResponse {
  threshold_rain_mm: number;
  sample_size_n: number;
  rainy_days_count: number;
  sample_proportion_p_hat: number;
  reference_proportion_p0: number;
  standard_error_under_H0: number;
  hypotheses: {
    null: string;
    alternative: string;
  };
  test_details: {
    test_name: string;
    test_statistic_z: number;
    significance_level_alpha: number;
    p_value: number;
    critical_value: number;
    rejection_region: string;
  };
  decision: string;
  interpretation: string;
}

export interface CorrelationResponse {
  selected_variables: string[];
  sample_size: number;
  correlation_matrix_pearson: Record<string, Record<string, number>>;
  correlation_matrix_spearman: Record<string, Record<string, number>>;
  covariance_matrix: Record<string, Record<string, number>>;
  heatmap_cells: Array<{
    var1: string;
    var2: string;
    pearson_r: number;
    spearman_rho: number;
  }>;
  pairwise_analysis: {
    var_x: string;
    var_y: string;
    covariance: number;
    pearson_r: number;
    pearson_p_value: number;
    spearman_rho: number;
    spearman_p_value: number;
    trend_slope: number;
    trend_intercept: number;
    strength: string;
    direction: string;
    scatter_data: Array<{ x: number; y: number; trend_y: number }>;
    interpretation: string;
  };
}

export interface RegressionResponse {
  model_type: string;
  target_variable: string;
  features_used: string[];
  train_observations: number;
  test_observations: number;
  train_test_split_date: string;
  train_metrics: {
    r2: number;
    adj_r2: number;
    mae_mm: number;
    rmse_mm: number;
  };
  validation_metrics: {
    r2: number;
    adj_r2: number;
    mae_mm: number;
    rmse_mm: number;
    r2_academic_explanation?: string;
  };
  model_parameters: {
    intercept: number;
    coefficients: Array<{
      feature: string;
      coefficient: number;
      interpretation: string;
    }>;
  };
  vif_multicollinearity: Record<string, number>;
  assumption_warnings: string[];
  physical_constraint_note: string;
  residual_diagnostics: {
    mean_residual: number;
    std_residual: number;
    histogram: Array<{ error_range: string; midpoint: number; frequency: number }>;
    residuals_vs_predicted: Array<{ predicted: number; residual: number }>;
  };
  holdout_time_series: Array<{
    date: string;
    actual: number;
    predicted: number;
    raw_unconstrained: number;
    residual: number;
  }>;
}

export interface ModelComparisonResponse {
  comparison_table: Array<{
    model_id: string;
    name: string;
    predictors: string;
    validation_mae: number;
    validation_rmse: number;
    validation_r2: number;
    interpretability: string;
  }>;
  recommended_model: string;
  recommendation_rationale: string;
  model_details: {
    simple: RegressionResponse;
    multiple: RegressionResponse;
    polynomial: RegressionResponse;
  };
}

export interface PredictionResponse {
  model_type_used: string;
  trained_sample_size: number;
  residual_standard_error_se: number;
  predictors_used: string[];
  daily_estimates: Array<{
    date: string;
    input_predictors: Record<string, number>;
    raw_regression_prediction_mm: number;
    model_rainfall_estimate_mm: number;
    prediction_interval_95: {
      lower_bound_mm: number;
      upper_bound_mm: number;
      margin_mm: number;
    };
    official_weather_forecast_reference_mm: number | null;
  }>;
  transparency_notice: {
    source_designation: string;
    is_official_forecast: boolean;
    clarification: string;
    prediction_interval_meaning: string;
  };
  coordinates: { latitude: number; longitude: number };
}
