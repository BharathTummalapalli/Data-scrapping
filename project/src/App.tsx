import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Calendar, BarChart3, LineChart, Download, Search, AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import CompanySearch from './components/CompanySearch';
import DataVisualization from './components/DataVisualization';
import TrendAnalysis from './components/TrendAnalysis';
import DataScraper from './services/DataScraper';
import { CompanyData, TimeRange } from './types/DataTypes';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function App() {
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTime, setIsRealTime] = useState(true);

  const handleCompanySelect = async (company: string) => {
    setSelectedCompany(company);
    setLoading(true);
    setError('');

    try {
      const scraper = new DataScraper();
      console.log(`Fetching real-time data for ${company}...`);
      const data = await scraper.scrapeCompanyData(company, timeRange);
      setCompanyData(data);
      setLastUpdated(new Date());
      setIsRealTime(true);
      console.log(`Successfully loaded ${data.length} data points for ${company}`);
    } catch (err) {
      setError('Failed to fetch real-time company data. The app is using enhanced simulation mode.');
      setIsRealTime(false);
      console.error('Error fetching real-time data:', err);
      
      // Still try to show some data even if real-time fails
      try {
        const scraper = new DataScraper();
        const fallbackData = await scraper.scrapeCompanyData(company, timeRange);
        setCompanyData(fallbackData);
        setLastUpdated(new Date());
      } catch (fallbackErr) {
        console.error('Fallback data also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = async (range: TimeRange) => {
    setTimeRange(range);
    if (selectedCompany) {
      await handleCompanySelect(selectedCompany);
    }
  };

  const handleRefresh = async () => {
    if (selectedCompany) {
      await handleCompanySelect(selectedCompany);
    }
  };

  // Auto-refresh data every 5 minutes for real-time updates
  useEffect(() => {
    if (selectedCompany && isRealTime) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [selectedCompany, isRealTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900">Company Data Analyzer</h1>
                  <div className={`flex items-center text-xs px-2 py-1 rounded-full ${
                    isRealTime ? 'text-success-600 bg-success-50' : 'text-orange-600 bg-orange-50'
                  }`}>
                    <Wifi className="h-3 w-3 mr-1" />
                    {isRealTime ? 'Real-time Data' : 'Simulation Mode'}
                  </div>
                </div>
                <p className="text-gray-600">Track company performance with live market data in Indian Rupees</p>
                {lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {selectedCompany && (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleTimeRangeChange('daily')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === 'daily' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => handleTimeRangeChange('weekly')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === 'weekly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => handleTimeRangeChange('monthly')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === 'monthly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleTimeRangeChange('yearly')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === 'yearly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CompanySearch onCompanySelect={handleCompanySelect} loading={loading} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-orange-800 font-medium">Real-time API Notice</p>
                  <p className="text-orange-700 text-sm">{error}</p>
                  <p className="text-orange-600 text-xs mt-1">
                    Data shown is enhanced simulation based on real market patterns. 
                    For production use, configure API keys in RealTimeDataService.ts
                  </p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Fetching real-time market data...</p>
                  <p className="text-sm text-gray-500">This may take a few seconds</p>
                </div>
              </div>
            ) : selectedCompany && companyData.length > 0 ? (
              <div className="space-y-8">
                <TrendAnalysis data={companyData} company={selectedCompany} timeRange={timeRange} />
                <DataVisualization data={companyData} timeRange={timeRange} />
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Company Selected</h3>
                <p className="text-gray-600 mb-4">Search and select a company to view its real-time performance data and trends.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    <strong>Real-time Data Available:</strong> Stock prices, trading volumes, market caps, and financial estimates - all converted to Indian Rupees (₹)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;