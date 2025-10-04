export interface Country {
  code: string;
  name: string;
  currency: string;
}

export interface ExchangeRates {
  [currency: string]: number;
}

// Fetch countries from REST Countries API
export const fetchCountries = async (): Promise<Country[]> => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,cca2');
    const data = await response.json();
    
    return data.map((country: any) => {
      const currencyCode = Object.keys(country.currencies || {})[0] || 'USD';
      return {
        code: country.cca2,
        name: country.name.common,
        currency: currencyCode,
      };
    }).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

// Fetch exchange rates
export const fetchExchangeRates = async (baseCurrency: string): Promise<ExchangeRates> => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
};

// Convert amount to USD
export const convertToUSD = async (amount: number, fromCurrency: string): Promise<number> => {
  if (fromCurrency === 'USD') return amount;
  
  try {
    const rates = await fetchExchangeRates(fromCurrency);
    const usdRate = rates['USD'];
    if (usdRate) {
      return amount * usdRate;
    }
    return amount;
  } catch (error) {
    console.error('Error converting currency:', error);
    return amount;
  }
};

// Simulate OCR extraction from receipt image
export interface OCRResult {
  amount?: number;
  date?: string;
  description?: string;
  vendor?: string;
  category?: string;
}

export const simulateOCR = async (file: File): Promise<OCRResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock OCR results
  const mockResults: OCRResult[] = [
    {
      amount: 45.99,
      date: new Date().toISOString().split('T')[0],
      description: 'Business lunch at Restaurant',
      vendor: 'The Bistro',
      category: 'Meals',
    },
    {
      amount: 120.50,
      date: new Date().toISOString().split('T')[0],
      description: 'Taxi to client meeting',
      vendor: 'Uber',
      category: 'Transportation',
    },
    {
      amount: 89.99,
      date: new Date().toISOString().split('T')[0],
      description: 'Office supplies purchase',
      vendor: 'Staples',
      category: 'Office Supplies',
    },
  ];
  
  // Return random mock result
  return mockResults[Math.floor(Math.random() * mockResults.length)];
};
