import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { LineChart, BarChart3, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { CompanyData, TimeRange } from '../types/DataTypes';
import CurrencyConverter from '../services/CurrencyConverter';

interface DataVisualizationProps {
  data: CompanyData[];
  timeRange: TimeRange;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, timeRange }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedMetric, setSelectedMetric] = useState<keyof CompanyData>('stockPrice');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (timeRange) {
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return format(date, 'MMM dd');
      case 'monthly':
        return format(date, 'MMM yyyy');
      case 'yearly':
        return format(date, 'yyyy');
      default:
        return format(date, 'MMM dd');
    }
  };

  const getMetricLabel = (metric: keyof CompanyData) => {
    const labels = {
      stockPrice: 'Stock Price (₹)',
      volume: 'Trading Volume',
      marketCap: 'Market Cap (₹ Cr)',
      revenue: 'Revenue (₹ Cr)',
      profit: 'Profit (₹ Cr)',
      employees: 'Employee Count'
    };
    return labels[metric] || metric;
  };

  const getMetricColor = (metric: keyof CompanyData) => {
    const colors = {
      stockPrice: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
      volume: { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
      marketCap: { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
      revenue: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
      profit: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
      employees: { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' }
    };
    return colors[metric] || colors.stockPrice;
  };

  const chartData = {
    labels: data.map(item => formatDate(item.date)),
    datasets: [
      {
        label: getMetricLabel(selectedMetric),
        data: data.map(item => {
          const value = item[selectedMetric] as number;
          // Format large numbers for better readability in crores
          if (selectedMetric === 'marketCap' || selectedMetric === 'revenue' || selectedMetric === 'profit') {
            return value / 10000000; // Convert to crores
          }
          return value;
        }),
        borderColor: getMetricColor(selectedMetric).border,
        backgroundColor: getMetricColor(selectedMetric).bg,
        tension: 0.4,
        fill: chartType === 'line',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${getMetricLabel(selectedMetric)} Over Time`,
        font: {
          size: 16,
          weight: 'bold' as const,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const metric = selectedMetric;
            
            if (metric === 'stockPrice') {
              return `Stock Price: ${CurrencyConverter.formatInr(value)}`;
            } else if (metric === 'marketCap' || metric === 'revenue' || metric === 'profit') {
              return `${getMetricLabel(metric)}: ${CurrencyConverter.formatInr(value * 10000000, 'crores')}`;
            } else if (metric === 'volume' || metric === 'employees') {
              return `${getMetricLabel(metric)}: ${value.toLocaleString('en-IN')}`;
            }
            return `${getMetricLabel(metric)}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            const metric = selectedMetric;
            if (metric === 'stockPrice') {
              return `₹${value.toLocaleString('en-IN')}`;
            } else if (metric === 'marketCap' || metric === 'revenue' || metric === 'profit') {
              return `₹${value}Cr`;
            } else if (metric === 'volume' || metric === 'employees') {
              return value.toLocaleString('en-IN');
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const metrics = [
    { key: 'stockPrice' as keyof CompanyData, label: 'Stock Price' },
    { key: 'volume' as keyof CompanyData, label: 'Volume' },
    { key: 'marketCap' as keyof CompanyData, label: 'Market Cap' },
    { key: 'revenue' as keyof CompanyData, label: 'Revenue' },
    { key: 'profit' as keyof CompanyData, label: 'Profit' },
    { key: 'employees' as keyof CompanyData, label: 'Employees' },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary-600" />
          Data Visualization
          <span className="ml-2 text-sm font-normal text-gray-600">
            (Exchange Rate: $1 = ₹{CurrencyConverter.getExchangeRate()})
          </span>
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as keyof CompanyData)}
            className="input-field w-auto"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>

          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'line' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LineChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'bar' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-96">
        {chartType === 'line' ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default DataVisualization;