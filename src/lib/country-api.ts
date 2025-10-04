export interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

export interface CountryCurrency {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
}

// Cache for countries data
let countriesCache: CountryCurrency[] | null = null;

/**
 * Fetch countries and their currencies from restcountries.com API
 */
export const fetchCountries = async (): Promise<CountryCurrency[]> => {
  if (countriesCache) {
    return countriesCache;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const countries: Country[] = await response.json();
    
    const countryCurrencies: CountryCurrency[] = countries
      .filter(country => country.currencies && Object.keys(country.currencies).length > 0)
      .map(country => {
        const currencyCode = Object.keys(country.currencies)[0];
        const currency = country.currencies[currencyCode];
        
        return {
          code: country.name.common,
          name: country.name.common,
          currency: currencyCode,
          currencySymbol: currency.symbol || currencyCode,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Cache the result
    countriesCache = countryCurrencies;
    return countryCurrencies;
  } catch (error) {
    console.error('Error fetching countries:', error);
    
    // Fallback to hardcoded countries if API fails
    return getFallbackCountries();
  }
};

/**
 * Fallback countries data in case API fails
 */
const getFallbackCountries = (): CountryCurrency[] => [
  { code: 'United States', name: 'United States', currency: 'USD', currencySymbol: '$' },
  { code: 'India', name: 'India', currency: 'INR', currencySymbol: '₹' },
  { code: 'United Kingdom', name: 'United Kingdom', currency: 'GBP', currencySymbol: '£' },
  { code: 'Germany', name: 'Germany', currency: 'EUR', currencySymbol: '€' },
  { code: 'France', name: 'France', currency: 'EUR', currencySymbol: '€' },
  { code: 'Canada', name: 'Canada', currency: 'CAD', currencySymbol: 'C$' },
  { code: 'Australia', name: 'Australia', currency: 'AUD', currencySymbol: 'A$' },
  { code: 'Japan', name: 'Japan', currency: 'JPY', currencySymbol: '¥' },
  { code: 'China', name: 'China', currency: 'CNY', currencySymbol: '¥' },
  { code: 'Brazil', name: 'Brazil', currency: 'BRL', currencySymbol: 'R$' },
];

/**
 * Get currency symbol for a given currency code
 */
export const getCurrencySymbol = (currencyCode: string): string => {
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
  
  return symbolMap[currencyCode] || currencyCode;
};

/**
 * Find country by name
 */
export const findCountryByName = (name: string, countries: CountryCurrency[]): CountryCurrency | undefined => {
  return countries.find(country => 
    country.name.toLowerCase() === name.toLowerCase() ||
    country.code.toLowerCase() === name.toLowerCase()
  );
};
