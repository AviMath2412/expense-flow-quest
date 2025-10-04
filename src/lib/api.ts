// Re-export from the new modules
export { fetchCountries, type CountryCurrency as Country } from './country-api';
export { 
  fetchExchangeRates, 
  convertCurrency, 
  getExchangeRate, 
  formatCurrency,
  type ExchangeRate 
} from './currency-converter';

// OCR extraction from receipt image
export interface OCRResult {
  amount?: number;
  date?: string;
  description?: string;
  vendor?: string;
  category?: string;
  currency?: string;
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

export const simulateOCR = async (file: File): Promise<OCRResult> => {
  // Simulate API delay for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Enhanced mock OCR results with more realistic data
  const mockResults: OCRResult[] = [
    {
      amount: 45.99,
      date: new Date().toISOString().split('T')[0],
      description: 'Business lunch with client',
      vendor: 'The Bistro Restaurant',
      category: 'Meals',
      currency: 'USD',
      items: [
        { description: 'Grilled Salmon', amount: 28.99 },
        { description: 'Caesar Salad', amount: 12.50 },
        { description: 'Coffee', amount: 4.50 }
      ]
    },
    {
      amount: 120.50,
      date: new Date().toISOString().split('T')[0],
      description: 'Taxi to client meeting',
      vendor: 'Uber Technologies',
      category: 'Transportation',
      currency: 'USD',
      items: [
        { description: 'Ride to downtown office', amount: 120.50 }
      ]
    },
    {
      amount: 89.99,
      date: new Date().toISOString().split('T')[0],
      description: 'Office supplies purchase',
      vendor: 'Staples Office Center',
      category: 'Office Supplies',
      currency: 'USD',
      items: [
        { description: 'Printer Paper (500 sheets)', amount: 24.99 },
        { description: 'Blue Ink Cartridge', amount: 35.00 },
        { description: 'Stapler', amount: 30.00 }
      ]
    },
    {
      amount: 156.75,
      date: new Date().toISOString().split('T')[0],
      description: 'Hotel accommodation for business trip',
      vendor: 'Marriott Hotel',
      category: 'Accommodation',
      currency: 'USD',
      items: [
        { description: 'One night stay', amount: 140.00 },
        { description: 'Room service', amount: 16.75 }
      ]
    },
    {
      amount: 67.20,
      date: new Date().toISOString().split('T')[0],
      description: 'Flight booking for conference',
      vendor: 'Delta Airlines',
      category: 'Travel',
      currency: 'USD',
      items: [
        { description: 'Economy class ticket', amount: 67.20 }
      ]
    },
    {
      amount: 234.50,
      date: new Date().toISOString().split('T')[0],
      description: 'Client entertainment dinner',
      vendor: 'Fine Dining Restaurant',
      category: 'Entertainment',
      currency: 'USD',
      items: [
        { description: 'Wine selection', amount: 85.00 },
        { description: 'Main course (2)', amount: 98.00 },
        { description: 'Dessert', amount: 28.50 },
        { description: 'Service charge', amount: 23.00 }
      ]
    }
  ];
  
  // Return random mock result
  return mockResults[Math.floor(Math.random() * mockResults.length)];
};

// Real OCR implementation using a service like Google Vision API or Tesseract.js
export const performOCR = async (file: File): Promise<OCRResult> => {
  // For now, we'll use the simulated OCR
  // In a real implementation, you would:
  // 1. Upload the image to an OCR service
  // 2. Process the text extraction
  // 3. Parse the receipt data
  // 4. Return structured data
  
  return simulateOCR(file);
};
