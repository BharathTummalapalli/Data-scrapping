import { CompanyData, TimeRange } from '../types/DataTypes';
import RealTimeDataService from './RealTimeDataService';

class DataScraper {
  private realTimeService: RealTimeDataService;
  
  constructor() {
    this.realTimeService = new RealTimeDataService();
  }

  async scrapeCompanyData(company: string, timeRange: TimeRange): Promise<CompanyData[]> {
    try {
      // Attempt to fetch real-time data
      console.log(`Fetching real-time data for ${company}...`);
      const data = await this.realTimeService.fetchRealTimeData(company, timeRange);
      console.log(`Successfully fetched ${data.length} data points for ${company}`);
      return data;
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      throw error;
    }
  }

  // Method to get latest real-time quote
  async getLatestData(company: string): Promise<CompanyData> {
    try {
      return await this.realTimeService.getLatestQuote(company);
    } catch (error) {
      console.error('Failed to fetch latest quote:', error);
      throw error;
    }
  }
}

export default DataScraper;