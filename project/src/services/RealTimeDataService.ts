import { CompanyData, TimeRange } from '../types/DataTypes';
import { subDays, subWeeks, subMonths, subYears, format } from 'date-fns';
import CurrencyConverter from './CurrencyConverter';

interface AlphaVantageResponse {
  'Meta Data': {
    '2. Symbol': string;
    '3. Last Refreshed': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface CompanyInfo {
  symbol: string;
  name: string;
  marketCap?: number;
  employees?: number;
  sector: string;
}

class RealTimeDataService {
  // Free API keys - you can get your own from these services
  private readonly ALPHA_VANTAGE_API_KEY = 'demo'; // Replace with your API key
  private readonly FINNHUB_API_KEY = 'demo'; // Replace with your API key
  
  // Company information mapping
  private readonly companyInfo: { [key: string]: CompanyInfo } = {
    'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 3000000000000, employees: 164000 },
    'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', marketCap: 2800000000000, employees: 221000 },
    'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce', marketCap: 1500000000000, employees: 1540000 },
    'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: 1700000000000, employees: 190000 },
    'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', marketCap: 800000000000, employees: 140000 },
    'META': { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Social Media', marketCap: 900000000000, employees: 77000 },
    'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', marketCap: 1200000000000, employees: 29000 },
    'NFLX': { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entertainment', marketCap: 180000000000, employees: 13000 },
  };

  async fetchRealTimeData(symbol: string, timeRange: TimeRange): Promise<CompanyData[]> {
    try {
      // Try multiple data sources for better reliability
      const data = await this.fetchFromAlphaVantage(symbol, timeRange);
      return data;
    } catch (error) {
      console.warn('Real-time API failed, using enhanced mock data:', error);
      // Fallback to enhanced mock data that simulates real market conditions
      return this.generateEnhancedMockData(symbol, timeRange);
    }
  }

  private async fetchFromAlphaVantage(symbol: string, timeRange: TimeRange): Promise<CompanyData[]> {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}&outputsize=full`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data: AlphaVantageResponse = await response.json();
    
    if (!data['Time Series (Daily)']) {
      throw new Error('Invalid API response format');
    }

    return this.processAlphaVantageData(data, symbol, timeRange);
  }

  private processAlphaVantageData(data: AlphaVantageResponse, symbol: string, timeRange: TimeRange): CompanyData[] {
    const timeSeries = data['Time Series (Daily)'];
    const dates = Object.keys(timeSeries).sort().reverse(); // Most recent first
    
    const periods = this.getPeriods(timeRange);
    const processedData: CompanyData[] = [];
    
    const companyInfo = this.companyInfo[symbol] || this.companyInfo['AAPL'];
    
    for (let i = 0; i < Math.min(periods, dates.length); i++) {
      const date = dates[i];
      const dayData = timeSeries[date];
      
      const stockPriceUSD = parseFloat(dayData['4. close']);
      const volumeShares = parseInt(dayData['5. volume']);
      
      // Convert to INR
      const stockPriceINR = CurrencyConverter.convertUsdToInr(stockPriceUSD);
      const marketCapINR = CurrencyConverter.convertUsdToInr(companyInfo.marketCap || 1000000000000);
      
      // Estimate revenue and profit based on market cap and industry averages
      const estimatedRevenueINR = CurrencyConverter.convertUsdToInr(this.estimateRevenue(companyInfo.marketCap || 1000000000000, symbol));
      const estimatedProfitINR = CurrencyConverter.convertUsdToInr(this.estimateProfit(estimatedRevenueINR / CurrencyConverter.getExchangeRate(), symbol));
      
      processedData.push({
        date: date,
        stockPrice: Math.round(stockPriceINR * 100) / 100,
        volume: volumeShares,
        marketCap: Math.round(marketCapINR),
        revenue: Math.round(estimatedRevenueINR),
        profit: Math.round(estimatedProfitINR),
        employees: companyInfo.employees || 100000
      });
    }
    
    return processedData.reverse(); // Return chronological order
  }

  private estimateRevenue(marketCapUSD: number, symbol: string): number {
    // Industry-specific revenue multipliers (very rough estimates)
    const revenueMultipliers: { [key: string]: number } = {
      'AAPL': 0.08,   // Apple: ~8% of market cap
      'MSFT': 0.07,   // Microsoft: ~7% of market cap
      'AMZN': 0.25,   // Amazon: ~25% of market cap (high revenue, lower margins)
      'GOOGL': 0.12,  // Google: ~12% of market cap
      'TSLA': 0.05,   // Tesla: ~5% of market cap
      'META': 0.04,   // Meta: ~4% of market cap
      'NVDA': 0.03,   // NVIDIA: ~3% of market cap
      'NFLX': 0.15,   // Netflix: ~15% of market cap
    };
    
    const multiplier = revenueMultipliers[symbol] || 0.08;
    return marketCapUSD * multiplier;
  }

  private estimateProfit(revenueUSD: number, symbol: string): number {
    // Industry-specific profit margins
    const profitMargins: { [key: string]: number } = {
      'AAPL': 0.25,   // Apple: ~25% profit margin
      'MSFT': 0.30,   // Microsoft: ~30% profit margin
      'AMZN': 0.05,   // Amazon: ~5% profit margin
      'GOOGL': 0.20,  // Google: ~20% profit margin
      'TSLA': 0.08,   // Tesla: ~8% profit margin
      'META': 0.25,   // Meta: ~25% profit margin
      'NVDA': 0.25,   // NVIDIA: ~25% profit margin
      'NFLX': 0.10,   // Netflix: ~10% profit margin
    };
    
    const margin = profitMargins[symbol] || 0.15;
    return revenueUSD * margin;
  }

  private getPeriods(timeRange: TimeRange): number {
    switch (timeRange) {
      case 'daily': return 30;
      case 'weekly': return 12;
      case 'monthly': return 12;
      case 'yearly': return 5;
      default: return 30;
    }
  }

  // Enhanced mock data that simulates real market conditions
  private generateEnhancedMockData(symbol: string, timeRange: TimeRange): CompanyData[] {
    const data: CompanyData[] = [];
    const now = new Date();
    let periods = this.getPeriods(timeRange);
    let dateSubtractor: (date: Date, amount: number) => Date;

    switch (timeRange) {
      case 'daily':
        dateSubtractor = subDays;
        break;
      case 'weekly':
        dateSubtractor = subWeeks;
        break;
      case 'monthly':
        dateSubtractor = subMonths;
        break;
      case 'yearly':
        dateSubtractor = subYears;
        break;
    }

    const companyInfo = this.companyInfo[symbol] || this.companyInfo['AAPL'];
    
    // Get current market data as base (simulated real-time prices)
    const currentStockPriceUSD = this.getCurrentStockPrice(symbol);
    const baseStockPriceINR = CurrencyConverter.convertUsdToInr(currentStockPriceUSD);
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = dateSubtractor(now, i);
      
      // Simulate realistic market volatility
      const volatility = this.getMarketVolatility(timeRange);
      const trendFactor = this.getMarketTrend(i, periods, symbol);
      const randomFactor = 1 + (Math.random() - 0.5) * volatility;
      
      const stockPrice = Math.round((baseStockPriceINR * trendFactor * randomFactor) * 100) / 100;
      const marketCap = CurrencyConverter.convertUsdToInr(companyInfo.marketCap || 1000000000000);
      const revenue = CurrencyConverter.convertUsdToInr(this.estimateRevenue(companyInfo.marketCap || 1000000000000, symbol));
      const profit = CurrencyConverter.convertUsdToInr(this.estimateProfit(revenue / CurrencyConverter.getExchangeRate(), symbol));
      
      data.push({
        date: format(date, 'yyyy-MM-dd'),
        stockPrice: stockPrice,
        volume: Math.round((50000000 + Math.random() * 100000000) * (symbol === 'TSLA' ? 2 : 1)),
        marketCap: Math.round(marketCap * trendFactor * randomFactor),
        revenue: Math.round(revenue * trendFactor * (1 + (Math.random() - 0.5) * 0.1)),
        profit: Math.round(profit * trendFactor * (1 + (Math.random() - 0.5) * 0.2)),
        employees: companyInfo.employees || 100000
      });
    }

    return data;
  }

  private getCurrentStockPrice(symbol: string): number {
    // Simulated current stock prices (in USD) - these would come from real-time APIs
    const currentPrices: { [key: string]: number } = {
      'AAPL': 175 + (Math.random() - 0.5) * 10,
      'MSFT': 340 + (Math.random() - 0.5) * 20,
      'AMZN': 140 + (Math.random() - 0.5) * 15,
      'GOOGL': 125 + (Math.random() - 0.5) * 10,
      'TSLA': 220 + (Math.random() - 0.5) * 30,
      'META': 320 + (Math.random() - 0.5) * 25,
      'NVDA': 450 + (Math.random() - 0.5) * 40,
      'NFLX': 380 + (Math.random() - 0.5) * 30,
    };
    
    return currentPrices[symbol] || currentPrices['AAPL'];
  }

  private getMarketVolatility(timeRange: TimeRange): number {
    switch (timeRange) {
      case 'daily': return 0.03;
      case 'weekly': return 0.06;
      case 'monthly': return 0.12;
      case 'yearly': return 0.20;
      default: return 0.03;
    }
  }

  private getMarketTrend(index: number, totalPeriods: number, symbol: string): number {
    const progress = index / totalPeriods;
    
    // Company-specific trend patterns
    const trendPatterns: { [key: string]: number } = {
      'AAPL': 0.85 + (progress * 0.3),   // Steady growth
      'MSFT': 0.80 + (progress * 0.4),   // Strong growth
      'AMZN': 0.90 + (progress * 0.2),   // Moderate growth
      'GOOGL': 0.85 + (progress * 0.3),  // Steady growth
      'TSLA': 0.70 + (progress * 0.6),   // Volatile growth
      'META': 0.75 + (progress * 0.5),   // Recovery growth
      'NVDA': 0.60 + (progress * 0.8),   // High growth
      'NFLX': 0.90 + (progress * 0.2),   // Slow growth
    };
    
    const baseTrend = trendPatterns[symbol] || 0.85 + (progress * 0.3);
    const cyclicalFactor = 1 + 0.05 * Math.sin(progress * Math.PI * 6);
    
    return baseTrend * cyclicalFactor;
  }

  // Method to get latest real-time quote
  async getLatestQuote(symbol: string): Promise<CompanyData> {
    try {
      // In a real implementation, this would fetch from a real-time API
      const currentPrice = this.getCurrentStockPrice(symbol);
      const companyInfo = this.companyInfo[symbol] || this.companyInfo['AAPL'];
      
      return {
        date: format(new Date(), 'yyyy-MM-dd'),
        stockPrice: CurrencyConverter.convertUsdToInr(currentPrice),
        volume: Math.round(50000000 + Math.random() * 100000000),
        marketCap: CurrencyConverter.convertUsdToInr(companyInfo.marketCap || 1000000000000),
        revenue: CurrencyConverter.convertUsdToInr(this.estimateRevenue(companyInfo.marketCap || 1000000000000, symbol)),
        profit: CurrencyConverter.convertUsdToInr(this.estimateProfit(this.estimateRevenue(companyInfo.marketCap || 1000000000000, symbol), symbol)),
        employees: companyInfo.employees || 100000
      };
    } catch (error) {
      throw new Error(`Failed to fetch latest quote for ${symbol}: ${error}`);
    }
  }
}

export default RealTimeDataService;