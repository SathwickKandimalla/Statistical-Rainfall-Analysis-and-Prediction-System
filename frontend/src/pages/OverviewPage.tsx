import React from 'react';
import {
  CloudRain,
  Droplets,
  Calendar,
  Activity,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Database,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { LocationItem, HistoricalWeatherResponse, DescriptiveStatsResponse } from '../types';
import { LocationMap } from '../components/LocationMap';

interface OverviewPageProps {
  location: LocationItem;
  weatherData: HistoricalWeatherResponse | null;
  descriptiveStats: DescriptiveStatsResponse | null;
  isLoading: boolean;
  onNavigate: (tab: any) => void;
}

// Module catalog with accents and descriptions
const MODULES = [
  {
    id: 'descriptive',
    num: 'I',
    title: 'Descriptive Statistics',
    desc: 'Central tendency, dispersion, skewness, frequency tables, ogives and Chebyshev inequality',
    accent: '#60a5fa',
  },
  {
    id: 'probability',
    num: 'II',
    title: 'Probability & Bayes',
    desc: 'Axioms, conditional probability P(A|B), Bayes theorem, independence and joint events',
    accent: '#a78bfa',
  },
  {
    id: 'random_variables',
    num: 'III',
    title: 'Random Variables',
    desc: 'PMF, PDF, CDF, expected value E[X], variance and moment generating functions',
    accent: '#22d3ee',
  },
  {
    id: 'discrete_dist',
    num: 'IV',
    title: 'Discrete Distributions',
    desc: 'Binomial and Poisson distributions, law of rare events, goodness-of-fit diagnostics',
    accent: '#fb923c',
  },
  {
    id: 'continuous_dist',
    num: 'V',
    title: 'Continuous Distributions',
    desc: 'Normal, Gamma, Exponential, Uniform distributions with KS fit tests',
    accent: '#c084fc',
  },
  {
    id: 'sampling',
    num: 'VI',
    title: 'Sampling & CLT',
    desc: 'Central Limit Theorem simulation, confidence intervals for mean, variance and F-test',
    accent: '#34d399',
  },
  {
    id: 'hypothesis_means',
    num: 'VII',
    title: 'Hypothesis Testing — Means',
    desc: 'One-sample Student\'s t-test, t-statistic, degrees of freedom, p-value, formal conclusion',
    accent: '#fbbf24',
  },
  {
    id: 'hypothesis_proportions',
    num: 'VIII',
    title: 'Hypothesis Testing — Proportions',
    desc: 'One-sample Z-test for rainy-day proportion, z-statistic, critical region, p-value',
    accent: '#fbbf24',
  },
  {
    id: 'correlation',
    num: 'IX',
    title: 'Correlation',
    desc: 'Pearson r, Spearman rank ρ, covariance matrix, scatter trends — correlation ≠ causation',
    accent: '#818cf8',
  },
  {
    id: 'regression',
    num: 'X',
    title: 'Regression & Prediction',
    desc: 'Simple, multiple & polynomial regression, chronological split, 95% prediction intervals',
    accent: '#10b981',
  },
];

export const OverviewPage: React.FC<OverviewPageProps> = ({
  location,
  weatherData,
  descriptiveStats,
  isLoading,
  onNavigate,
}) => {
  if (isLoading || !weatherData || !descriptiveStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono text-center max-w-sm">
          Executing statistical pipeline on Open-Meteo ERA5 historical meteorological records…
        </p>
      </div>
    );
  }

  const { quality_report, records } = weatherData;
  const { central_tendency, dispersion, monthly_summary } = descriptiveStats;

  let mostRainyMonth = 'N/A';
  if (monthly_summary && monthly_summary.length > 0) {
    const sorted = [...monthly_summary].sort((a, b) => b.rain_sum - a.rain_sum);
    mostRainyMonth = `${sorted[0].month_name} (${sorted[0].rain_sum.toFixed(1)} mm)`;
  }

  const recentDays = records.slice(-60);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">

      {/* ── Hero Banner ── */}
      <div className="rounded-2xl px-6 py-7 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1a2e 0%, #0a1520 60%, #07100c 100%)', border: '1px solid #1a2d40' }}>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-cyan-400"
                style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
                B.Tech Year 2 Term 1 • Academic Term Project
              </span>
            </div>
            <h1 className="sci-page-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.6rem' }}>
              Statistical Rainfall Analysis<br />
              <span style={{ color: '#10b981' }}>&amp; Prediction System</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              A real-world probability and statistical inference platform executing{' '}
              <strong className="text-slate-200">Modules I through X</strong> on high-resolution
              ERA5 atmospheric reanalysis data for{' '}
              <strong className="text-white">{location.name}, {location.country}</strong>.
            </p>

            {/* Conceptual flow */}
            <div className="sci-flow mt-4">
              <span className="sci-flow-step">Data</span>
              <span className="sci-flow-arrow">→</span>
              <span className="sci-flow-step">Statistics</span>
              <span className="sci-flow-arrow">→</span>
              <span className="sci-flow-step">Probability</span>
              <span className="sci-flow-arrow">→</span>
              <span className="sci-flow-step">Inference</span>
              <span className="sci-flow-arrow">→</span>
              <span className="sci-flow-step">Correlation</span>
              <span className="sci-flow-arrow">→</span>
              <span className="sci-flow-step">Regression</span>
              <span className="sci-flow-arrow">→</span>
              <span className="sci-flow-step" style={{ color: '#34d399', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)' }}>Prediction</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Live Statistical Engine Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Database className="w-3 h-3" />
              <span className="font-mono">{quality_report.total_records.toLocaleString()} daily records</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3 h-3" />
              <span className="font-mono">{quality_report.min_date} → {quality_report.max_date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{location.name}, {location.admin1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary KPI Metrics ── */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
          <span>Primary Statistical Indicators</span>
          <div className="flex-1 h-px" style={{ background: '#1a2540' }} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Primary metric — daily mean (most important) */}
          <div className="col-span-2 lg:col-span-1 sci-metric-card"
            style={{ border: '1px solid rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.03)' }}>
            <span className="sci-metric-label">Daily Mean Rainfall (x̄)</span>
            <div className="sci-metric-value text-cyan-300" style={{ fontSize: '2.25rem' }}>
              {central_tendency.mean.toFixed(2)}
              <span className="text-sm font-normal text-slate-400 ml-1">mm/day</span>
            </div>
            <div className="sci-metric-sub mt-1">
              Median = {central_tendency.median.toFixed(2)} mm · Skewness = {dispersion.skewness.toFixed(2)}
            </div>
          </div>

          <div className="sci-metric-card">
            <span className="sci-metric-label flex items-center gap-1">
              <CloudRain className="w-3 h-3 text-sky-400" />
              Rainy-Day Proportion P(A)
            </span>
            <div className="sci-metric-value text-sky-300">{quality_report.rainy_day_percentage.toFixed(1)}%</div>
            <div className="sci-metric-sub">
              {quality_report.rainy_days} rainy / {quality_report.dry_days} dry days
            </div>
          </div>

          <div className="sci-metric-card">
            <span className="sci-metric-label flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-400" />
              Sample Std Dev (s)
            </span>
            <div className="sci-metric-value text-indigo-300">{dispersion.std_sample.toFixed(2)}<span className="text-sm font-normal text-slate-400 ml-1">mm</span></div>
            <div className="sci-metric-sub">CV = {dispersion.coefficient_of_variation_pct.toFixed(1)}% (high relative dispersion)</div>
          </div>

          <div className="sci-metric-card">
            <span className="sci-metric-label flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Max Recorded Event
            </span>
            <div className="sci-metric-value text-emerald-300">{dispersion.max.toFixed(1)}<span className="text-sm font-normal text-slate-400 ml-1">mm/day</span></div>
            <div className="sci-metric-sub">Peak: {mostRainyMonth}</div>
          </div>
        </div>
      </div>

      {/* ── Map + Monthly Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LocationMap location={location} />
        </div>

        <div className="lg:col-span-2 sci-chart-container">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="sci-chart-title flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Monthly Climatological Rainfall Aggregate
              </h2>
              <p className="sci-chart-subtitle">
                Mean cumulative rainfall (mm) per calendar month across {quality_report.total_records.toLocaleString()} daily records
              </p>
            </div>
            <button
              onClick={() => onNavigate('descriptive')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
            >
              Module I <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_summary || []} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                <XAxis dataKey="month_name" stroke="#3b4f6b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis stroke="#3b4f6b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#253045', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} mm`, 'Rainfall Sum']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="rain_sum" fill="#22d3ee" radius={[3, 3, 0, 0]} name="Monthly Rainfall (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t flex justify-between items-center text-[11px] text-slate-500"
            style={{ borderColor: '#1a2540' }}>
            <span>Direct aggregation from {quality_report.total_records.toLocaleString()} daily records</span>
            <span className="font-mono text-cyan-500">Peak: {mostRainyMonth}</span>
          </div>
        </div>
      </div>

      {/* ── Recent Time-Series ── */}
      <div className="sci-chart-container">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div>
            <h2 className="sci-chart-title flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Recent Daily Rainfall Progression
            </h2>
            <p className="sci-chart-subtitle">Last 60 chronological daily observations (mm/day)</p>
          </div>
          <button
            onClick={() => onNavigate('explorer')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
          >
            Full Data Table <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="h-52 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentDays} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rainAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
              <XAxis dataKey="date" stroke="#3b4f6b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis stroke="#3b4f6b" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0e1a', borderColor: '#253045', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${val} mm`, 'Rainfall']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="rain_sum" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#rainAreaGrad)" name="Rainfall (mm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Module Navigation Grid ── */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
          <span>Syllabus Modules I – X</span>
          <div className="flex-1 h-px" style={{ background: '#1a2540' }} />
          <span>Select to explore</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className="p-4 rounded-xl text-left transition-all duration-150 group hover:scale-[1.01]"
              style={{
                background: '#0f1521',
                border: '1px solid #1a2540',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${m.accent}50`;
                (e.currentTarget as HTMLElement).style.background = `color-mix(in srgb, ${m.accent} 4%, #0f1521)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#1a2540';
                (e.currentTarget as HTMLElement).style.background = '#0f1521';
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded"
                    style={{ background: `color-mix(in srgb, ${m.accent} 12%, transparent)`, color: m.accent }}>
                    {m.num}
                  </span>
                  <h3 className="text-[13px] font-bold text-slate-200 leading-tight">{m.title}</h3>
                </div>
                <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-600 group-hover:text-slate-400 transition" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
