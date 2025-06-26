class CurrencyConverter {
  // Current USD to INR exchange rate (this would typically come from a live API)
  private static readonly USD_TO_INR_RATE = 83.25; // As of recent rates
  
  static convertUsdToInr(usdAmount: number): number {
    return Math.round(usdAmount * this.USD_TO_INR_RATE);
  }
  
  static formatInr(amount: number, type: 'currency' | 'crores' | 'lakhs' = 'currency'): string {
    switch (type) {
      case 'crores':
        const crores = amount / 10000000; // 1 crore = 10 million
        if (crores >= 1000) {
          return `₹${(crores / 1000).toFixed(2)} Lakh Cr`;
        }
        return `₹${crores.toFixed(2)} Cr`;
      
      case 'lakhs':
        const lakhs = amount / 100000; // 1 lakh = 100 thousand
        if (lakhs >= 10000) {
          return `₹${(lakhs / 10000).toFixed(2)} Cr`;
        }
        return `₹${lakhs.toFixed(2)} L`;
      
      case 'currency':
      default:
        // Format in Indian numbering system
        return `₹${amount.toLocaleString('en-IN')}`;
    }
  }
  
  static getExchangeRate(): number {
    return this.USD_TO_INR_RATE;
  }
  
  // Format large amounts appropriately for Indian context
  static formatLargeAmount(amount: number): string {
    if (amount >= 10000000000) { // 1000 crores
      return this.formatInr(amount, 'crores');
    } else if (amount >= 100000) { // 1 lakh
      return this.formatInr(amount, 'lakhs');
    } else {
      return this.formatInr(amount, 'currency');
    }
  }
}

export default CurrencyConverter;