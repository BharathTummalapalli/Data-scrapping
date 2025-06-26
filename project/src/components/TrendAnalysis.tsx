import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Users, BarChart3 } from 'lucide-react';
import { CompanyData, TimeRange, TrendData } from '../types/DataTypes';
import CurrencyConverter from '../services/CurrencyConverter';

interface TrendAnalysisProps {
  data: CompanyData[];
  company: string;
  timeRange: TimeRange;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data, company, timeRange }) => {
  const calculateTrend = (current: number, previous: number): TrendData['trend'] => {
    const changePercent = ((current - previous) / previous) * 100;
    if (Math.abs(changePercent) < 1) return 'stable';
    return changePercent > 0 ? 'up' : 'down';
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'currency':
        return CurrencyConverter.formatInr(value);
      case 'crores':
        return CurrencyConverter.formatInr(value, 'crores');
      case 'lakhs':
        return CurrencyConverter.formatInr(value, 'lakhs');
      case 'number':
        return value.toLocaleString('en-IN');
      default:
        return value.toString();
    }
  };

  const getTrendData = (): TrendData[] => {
    if (data.length < 2) return [];

    const current = data[data.length - 1];
    const previous = data[data.length - 2];

    return [
      {
        metric: 'Stock Price',
        current: current.stockPrice,
        previous: previous.stockPrice,
        change: current.stockPrice - previous.stockPrice,
        changePercent: ((current.stockPrice - previous.stockPrice) / previous.stockPrice) * 100,
        trend: calculateTrend(current.stockPrice, previous.stockPrice)
      },
      {
        metric: 'Market Cap',
        current: current.marketCap,
        previous: previous.marketCap,
        change: current.marketCap - previous.marketCap,
        changePercent: ((current.marketCap - previous.marketCap) / previous.marketCap) * 100,
        trend: calculateTrend(current.marketCap, previous.marketCap)
      },
      {
        metric: 'Revenue',
        current: current.revenue,
        previous: previous.revenue,
        change: current.revenue - previous.revenue,
        changePercent: ((current.revenue - previous.revenue) / previous.revenue) * 100,
        trend: calculateTrend(current.revenue, previous.revenue)
      },
      {
        metric: 'Profit',
        current: current.profit,
        previous: previous.profit,
        change: current.profit - previous.profit,
        changePercent: ((current.profit - previous.profit) / previous.profit) * 100,
        trend: calculateTrend(current.profit, previous.profit)
      }
    ];
  };

  const trendData = getTrendData();

  const getTrendIcon = (trend: TrendData['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: TrendData['trend']) => {
    switch (trend) {
      case 'up':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'down':
        return 'text-danger-600 bg-danger-50 border-danger-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'Stock Price':
      case 'Market Cap':
      case 'Revenue':
      case 'Profit':
        return <DollarSign className="h-5 w-5" />;
      case 'Employees':
        return <Users className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  if (trendData.length === 0) {
    return (
      <div className="card">
        <p className="text-gray-600 text-center">Not enough data to show trends. Please select a company.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {company} - Trend Analysis ({timeRange})
          </h2>
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Exchange Rate: $1 = ₹{CurrencyConverter.getExchangeRate()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendData.map((trend) => (
            <div key={trend.metric} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getMetricIcon(trend.metric)}
                  <span className="text-sm font-medium text-gray-700">{trend.metric}</span>
                </div>
                {getTrendIcon(trend.trend)}
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-semibold text-gray-900">
                  {trend.metric === 'Stock Price' 
                    ? formatValue(trend.current, 'currency')
                    : formatValue(trend.current, 'crores')
                  }
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTrendColor(trend.trend)}`}>
                  {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="space-y-3">
            {trendData.map((trend) => (
              <div key={trend.metric} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700">{trend.metric}</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    trend.trend === 'up' ? 'text-success-600' : 
                    trend.trend === 'down' ? 'text-danger-600' : 'text-gray-600'
                  }`}>
                    {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(2)}%
                  </span>
                  {getTrendIcon(trend.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-800">
                <strong>Overall Trend:</strong> {
                  trendData.filter(t => t.trend === 'up').length > trendData.filter(t => t.trend === 'down').length
                    ? 'Positive growth trajectory'
                    : trendData.filter(t => t.trend === 'down').length > trendData.filter(t => t.trend === 'up').length
                    ? 'Declining performance'
                    : 'Mixed performance indicators'
                }
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Best Performer:</strong> {
                  trendData.reduce((best, current) => 
                    current.changePercent > best.changePercent ? current : best
                  ).metric
                } ({trendData.reduce((best, current) => 
                  current.changePercent > best.changePercent ? current : best
                ).changePercent.toFixed(2)}%)
              </p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>Data Points:</strong> {data.length} {timeRange} periods analyzed
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Currency Note:</strong> All values converted from USD to INR at current exchange rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;