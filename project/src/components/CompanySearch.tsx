import React, { useState } from 'react';
import { Search, Building2, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import CurrencyConverter from '../services/CurrencyConverter';

interface CompanySearchProps {
  onCompanySelect: (company: string) => void;
  loading: boolean;
}

const popularCompanies = [
  { name: 'Apple Inc.', symbol: 'AAPL', sector: 'Technology', realTime: true },
  { name: 'Microsoft Corporation', symbol: 'MSFT', sector: 'Technology', realTime: true },
  { name: 'Amazon.com Inc.', symbol: 'AMZN', sector: 'E-commerce', realTime: true },
  { name: 'Alphabet Inc.', symbol: 'GOOGL', sector: 'Technology', realTime: true },
  { name: 'Tesla Inc.', symbol: 'TSLA', sector: 'Automotive', realTime: true },
  { name: 'Meta Platforms Inc.', symbol: 'META', sector: 'Social Media', realTime: true },
  { name: 'NVIDIA Corporation', symbol: 'NVDA', sector: 'Technology', realTime: true },
  { name: 'Netflix Inc.', symbol: 'NFLX', sector: 'Entertainment', realTime: true },
];

const CompanySearch: React.FC<CompanySearchProps> = ({ onCompanySelect, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  const filteredCompanies = popularCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanyClick = (company: typeof popularCompanies[0]) => {
    setSelectedCompany(company.symbol);
    onCompanySelect(company.symbol);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary-600" />
          Company Search
          <div className="ml-auto flex items-center text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full">
            <Wifi className="h-3 w-3 mr-1" />
            Real-time Data
          </div>
        </h2>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCompanies.map((company) => (
            <button
              key={company.symbol}
              onClick={() => handleCompanyClick(company)}
              disabled={loading}
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                selectedCompany === company.symbol
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{company.symbol}</div>
                    {company.realTime && (
                      <div className="flex items-center text-xs text-success-600">
                        <Wifi className="h-3 w-3 mr-1" />
                        Live
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 truncate">{company.name}</div>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">
                  {company.sector}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-success-600" />
          Real-time Features
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></div>
            Live stock prices (₹)
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
            Real-time trading volume
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Market cap updates (₹ Cr)
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
            Financial estimates (₹ Cr)
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Currency:</strong> All values in Indian Rupees (₹)<br/>
            <strong>Exchange Rate:</strong> $1 = ₹{CurrencyConverter.getExchangeRate()}<br/>
            <strong>Data Source:</strong> Alpha Vantage API + Financial APIs
          </p>
        </div>

        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            <strong>Real-time Status:</strong> Connected to live market data feeds<br/>
            <strong>Update Frequency:</strong> Every market minute during trading hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySearch;