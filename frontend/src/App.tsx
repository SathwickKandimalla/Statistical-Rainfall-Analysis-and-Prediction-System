import React, { useState, useEffect, useCallback } from 'react';
import type { LocationItem, HistoricalWeatherResponse, DescriptiveStatsResponse } from './types';
import { fetchHistoricalWeather, fetchDescriptiveStats } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { LocationSearchModal } from './components/LocationSearchModal';
import { DateRangeModal } from './components/DateRangeModal';
import { OverviewPage } from './pages/OverviewPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { DescriptiveStatsPage } from './pages/DescriptiveStatsPage';
import { ProbabilityPage } from './pages/ProbabilityPage';
import { RandomVariablesPage } from './pages/RandomVariablesPage';
import { DistributionsPage } from './pages/DistributionsPage';
import { SamplingPage } from './pages/SamplingPage';
import { HypothesisMeansPage } from './pages/HypothesisMeansPage';
import { HypothesisProportionsPage } from './pages/HypothesisProportionsPage';
import { HypothesisPage } from './pages/HypothesisPage';
import { CorrelationPage } from './pages/CorrelationPage';
import { RegressionPage } from './pages/RegressionPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { VivaGuidePage } from './pages/VivaGuidePage';
import { DataSourcePage } from './pages/DataSourcePage';
import { AlertCircle } from 'lucide-react';

const DEFAULT_LOCATION: LocationItem = {
  id: 1269843,
  name: 'Hyderabad',
  country: 'India',
  admin1: 'Telangana',
  latitude: 17.3850,
  longitude: 78.4867,
  timezone: 'Asia/Kolkata',
  country_code: 'IN',
};

export const App: React.FC = () => {
  const [location, setLocation] = useState<LocationItem>(DEFAULT_LOCATION);
  const [startDate, setStartDate] = useState<string>('2019-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');

  const [weatherData, setWeatherData] = useState<HistoricalWeatherResponse | null>(null);
  const [descriptiveStats, setDescriptiveStats] = useState<DescriptiveStatsResponse | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalWeather(
        location.latitude,
        location.longitude,
        startDate,
        endDate,
        location.timezone
      );
      setWeatherData(data);

      const stats = await fetchDescriptiveStats({
        dataset_key: data.dataset_key,
        variable: 'rain_sum',
      });
      setDescriptiveStats(stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load meteorological records. Verify internet connectivity.');
    } finally {
      setIsLoading(false);
    }
  }, [location, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: '#0a0e1a', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top Navbar */}
      <Navbar
        location={location}
        startDate={startDate}
        endDate={endDate}
        totalRecords={weatherData?.total_records || 0}
        isLoading={isLoading}
        onOpenLocationSearch={() => setIsLocationModalOpen(true)}
        onOpenDateRange={() => setIsDateModalOpen(true)}
        onRefresh={loadData}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content Area */}
        <main className="flex-1 lg:pl-64 w-full min-w-0 transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {error && (
              <div className="mb-6 p-4 rounded-xl text-xs text-red-200 flex items-center space-x-3 shadow-lg"
                style={{ background: 'rgba(127,29,29,0.4)', border: '1px solid #7f1d1d' }}>
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div className="flex-1">
                  <strong className="block text-white">Connection or Data Retrieval Error:</strong>
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadData}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-medium text-xs transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Page Router */}
            {currentTab === 'overview' && (
              <OverviewPage
                location={location}
                weatherData={weatherData}
                descriptiveStats={descriptiveStats}
                isLoading={isLoading}
                onNavigate={(t) => setCurrentTab(t)}
              />
            )}

            {currentTab === 'explorer' && (
              <DataExplorerPage
                weatherData={weatherData}
                locationName={location.name}
                onDataUpdated={(newData) => {
                  setWeatherData(newData);
                  fetchDescriptiveStats({ dataset_key: newData.dataset_key, variable: 'rain_sum' }).then(setDescriptiveStats);
                }}
              />
            )}

            {currentTab === 'descriptive' && weatherData && (
              <DescriptiveStatsPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'probability' && weatherData && (
              <ProbabilityPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'random_variables' && weatherData && (
              <RandomVariablesPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'discrete_dist' && weatherData && (
              <DistributionsPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'continuous_dist' && weatherData && (
              <DistributionsPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'sampling' && weatherData && (
              <SamplingPage datasetKey={weatherData.dataset_key} />
            )}

            {/* Module VII — Hypothesis Testing: Means (new separate route) */}
            {currentTab === 'hypothesis_means' && weatherData && (
              <HypothesisMeansPage datasetKey={weatherData.dataset_key} />
            )}

            {/* Module VIII — Hypothesis Testing: Proportions (new separate route) */}
            {currentTab === 'hypothesis_proportions' && weatherData && (
              <HypothesisProportionsPage datasetKey={weatherData.dataset_key} />
            )}

            {/* Legacy combined hypothesis route — kept for backward compatibility */}
            {currentTab === 'hypothesis' && weatherData && (
              <HypothesisPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'correlation' && weatherData && (
              <CorrelationPage datasetKey={weatherData.dataset_key} />
            )}

            {currentTab === 'regression' && weatherData && (
              <RegressionPage datasetKey={weatherData.dataset_key} location={location} />
            )}

            {currentTab === 'methodology' && <MethodologyPage />}

            {currentTab === 'viva' && <VivaGuidePage />}

            {currentTab === 'datasource' && (
              <DataSourcePage weatherData={weatherData} location={location} />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(loc) => {
          setLocation(loc);
        }}
        currentLocation={location}
      />

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        startDate={startDate}
        endDate={endDate}
        onApplyDateRange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
        }}
      />
    </div>
  );
};

export default App;
