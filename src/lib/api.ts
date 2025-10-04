// Re-export from the new modules
export { fetchCountries, type CountryCurrency as Country } from './country-api';
export { 
  fetchExchangeRates, 
  convertCurrency, 
  getExchangeRate, 
  formatCurrency,
  type ExchangeRate 
} from './currency-converter';

// Re-export OCR functionality from the OCR service
export { performOCR, type OCRResult } from './ocr-service';
