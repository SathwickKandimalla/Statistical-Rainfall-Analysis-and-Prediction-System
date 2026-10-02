import type {
  LocationItem,
  HistoricalWeatherResponse,
  DescriptiveStatsResponse,
  ProbabilityResponse,
  RandomVariablesResponse,
  DiscreteDistributionsResponse,
  ContinuousDistributionsResponse,
  SamplingResponse,
  EstimationResponse,
  VarianceComparisonResponse,
  HypothesisMeanResponse,
  HypothesisPropResponse,
  CorrelationResponse,
  RegressionResponse,
  ModelComparisonResponse,
  PredictionResponse,
} from "../types";

const BASE_URL = "/api";

export async function searchLocations(query: string): Promise<LocationItem[]> {
  const res = await fetch(`${BASE_URL}/location/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Location search failed");
  const data = await res.json();
  return data.results || [];
}

export async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timezone: string = "auto",
  rainThreshold: number = 1.0
): Promise<HistoricalWeatherResponse> {
  const url = `${BASE_URL}/weather/historical?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&timezone=${encodeURIComponent(timezone)}&rain_threshold=${rainThreshold}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch historical weather data");
  }
  return res.json();
}

export async function uploadWeatherFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/weather/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload file");
  }
  return res.json();
}

export async function fetchDescriptiveStats(payload: {
  dataset_key?: string;
  variable?: string;
  chebyshev_k?: number;
  bins?: number;
  filter_positive?: boolean;
}): Promise<DescriptiveStatsResponse> {
  const res = await fetch(`${BASE_URL}/analysis/descriptive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute descriptive statistics");
  return res.json();
}

export async function fetchProbabilityAnalysis(payload: {
  dataset_key?: string;
  rain_threshold?: number;
  high_humidity_threshold?: number;
  high_temp_threshold?: number;
}): Promise<ProbabilityResponse> {
  const res = await fetch(`${BASE_URL}/analysis/probability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute probability analysis");
  return res.json();
}

export async function fetchRandomVariablesAnalysis(payload: {
  dataset_key?: string;
  variable?: string;
}): Promise<RandomVariablesResponse> {
  const res = await fetch(`${BASE_URL}/analysis/random-variables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute random variable analysis");
  return res.json();
}

export async function fetchDiscreteDistributions(payload: {
  dataset_key?: string;
  n_days?: number;
  rain_threshold?: number;
  heavy_rain_threshold?: number;
}): Promise<DiscreteDistributionsResponse> {
  const res = await fetch(`${BASE_URL}/analysis/discrete-distributions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute discrete distributions");
  return res.json();
}

export async function fetchContinuousDistributions(payload: {
  dataset_key?: string;
  variable?: string;
  filter_positive?: boolean;
  distributions?: string[];
}): Promise<ContinuousDistributionsResponse> {
  const res = await fetch(`${BASE_URL}/analysis/continuous-distributions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to fit continuous distributions");
  return res.json();
}

export async function fetchSamplingSimulation(payload: {
  dataset_key?: string;
  variable?: string;
  sample_size?: number;
  num_samples?: number;
  method?: string;
  filter_positive?: boolean;
}): Promise<SamplingResponse> {
  const res = await fetch(`${BASE_URL}/analysis/sampling`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to simulate sampling and CLT");
  return res.json();
}

export async function fetchEstimation(payload: {
  dataset_key?: string;
  variable?: string;
  rain_threshold?: number;
}): Promise<EstimationResponse> {
  const res = await fetch(`${BASE_URL}/analysis/estimation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute estimation intervals");
  return res.json();
}

export async function fetchVarianceComparison(payload: {
  dataset_key?: string;
  variable?: string;
  split_date?: string;
}): Promise<VarianceComparisonResponse> {
  const res = await fetch(`${BASE_URL}/analysis/variance-comparison`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute variance comparison");
  return res.json();
}

export async function fetchHypothesisMean(payload: {
  dataset_key?: string;
  variable?: string;
  reference_mean: number;
  alpha?: number;
  alternative?: string;
}): Promise<HypothesisMeanResponse> {
  const res = await fetch(`${BASE_URL}/analysis/hypothesis-mean`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to run hypothesis test for mean");
  return res.json();
}

export async function fetchHypothesisProp(payload: {
  dataset_key?: string;
  rain_threshold?: number;
  reference_proportion: number;
  alpha?: number;
  alternative?: string;
}): Promise<HypothesisPropResponse> {
  const res = await fetch(`${BASE_URL}/analysis/hypothesis-proportion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to run hypothesis test for proportion");
  return res.json();
}

export async function fetchCorrelation(payload: {
  dataset_key?: string;
  variables?: string[];
  var_x?: string;
  var_y?: string;
}): Promise<CorrelationResponse> {
  const res = await fetch(`${BASE_URL}/analysis/correlation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compute correlation analysis");
  return res.json();
}

export async function fetchRegression(payload: {
  dataset_key?: string;
  model_type?: string;
  target_variable?: string;
  predictor_variables?: string[];
  train_split?: number;
  poly_degree?: number;
}): Promise<RegressionResponse> {
  const res = await fetch(`${BASE_URL}/analysis/regression`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to train regression model");
  return res.json();
}

export async function fetchModelComparison(payload: {
  dataset_key?: string;
  target_variable?: string;
  train_split?: number;
}): Promise<ModelComparisonResponse> {
  const res = await fetch(`${BASE_URL}/analysis/model-comparison`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to compare regression models");
  return res.json();
}

export async function fetchPrediction(payload: {
  dataset_key?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  model_type?: string;
  poly_degree?: number;
}): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/prediction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate model-based prediction");
  return res.json();
}
