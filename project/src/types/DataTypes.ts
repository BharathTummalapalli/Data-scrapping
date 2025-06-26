export interface CompanyData {
  date: string;
  stockPrice: number;
  volume: number;
  marketCap: number;
  revenue: number;
  profit: number;
  employees: number;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface TrendData {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}