export interface ExchangeRate {
  [currency: string]: number;
}

export interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: ExchangeRate;
}

// Cache for exchange rates
let exchangeRatesCache: { [baseCurrency: string]: { rates: ExchangeRate; timestamp: number } } = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch exchange rates from exchangerate-api.com
 */
export const fetchExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRate> => {
  const now = Date.now();
  const cached = exchangeRatesCache[baseCurrency];
  
  // Return cached rates if they're still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.rates;
  }

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ExchangeRateResponse = await response.json();
    
    // Cache the rates
    exchangeRatesCache[baseCurrency] = {
      rates: data.rates,
      timestamp: now
    };
    
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return cached rates even if expired, or fallback rates
    if (cached) {
      return cached.rates;
    }
    
    // Fallback to 1:1 rates if no cache available
    return getFallbackRates(baseCurrency);
  }
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }
    
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error(`Failed to convert ${fromCurrency} to ${toCurrency}`);
  }
};

/**
 * Get exchange rate between two currencies
 */
export const getExchangeRate = async (
  fromCurrency: string,
  toCurrency: string
): Promise<number> => {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const rate = rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }
    
    return rate;
  } catch (error) {
    console.error('Exchange rate error:', error);
    throw new Error(`Failed to get exchange rate from ${fromCurrency} to ${toCurrency}`);
  }
};

/**
 * Fallback exchange rates (approximate values)
 */
const getFallbackRates = (baseCurrency: string): ExchangeRate => {
  const fallbackRates: { [key: string]: ExchangeRate } = {
    'USD': {
      'USD': 1,
      'INR': 83.0,
      'EUR': 0.92,
      'GBP': 0.79,
      'CAD': 1.36,
      'AUD': 1.52,
      'JPY': 150.0,
      'CNY': 7.2,
      'BRL': 5.0,
    },
    'INR': {
      'USD': 0.012,
      'INR': 1,
      'EUR': 0.011,
      'GBP': 0.0095,
      'CAD': 0.016,
      'AUD': 0.018,
      'JPY': 1.8,
      'CNY': 0.087,
      'BRL': 0.06,
    },
    'EUR': {
      'USD': 1.09,
      'INR': 90.0,
      'EUR': 1,
      'GBP': 0.86,
      'CAD': 1.48,
      'AUD': 1.65,
      'JPY': 163.0,
      'CNY': 7.8,
      'BRL': 5.4,
    },
  };
  
  return fallbackRates[baseCurrency] || { [baseCurrency]: 1 };
};

/**
 * Format currency amount with proper symbol and decimals
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  decimals: number = 2
): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(decimals)}`;
};

/**
 * Get currency symbol for display
 */
const getCurrencySymbol = (currency: string): string => {
  const symbolMap: { [key: string]: string } = {
    'USD': '$',
    'INR': '₹',
    'GBP': '£',
    'EUR': '€',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
    'BRL': 'R$',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'KRW': '₩',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'MXN': '$',
    'ZAR': 'R',
    'TRY': '₺',
    'AED': 'د.إ',
    'SAR': '﷼',
    'EGP': '£',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫',
  };
  
  return symbolMap[currency] || currency;
};
