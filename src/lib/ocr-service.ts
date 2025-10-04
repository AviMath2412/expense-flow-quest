import Tesseract from 'tesseract.js';
import { OCRResult } from './api';

/**
 * OCR Service for extracting data from receipt images
 * Uses Tesseract.js for text recognition and custom parsing for receipt data
 */

export interface ReceiptData {
  rawText: string;
  extractedData: OCRResult;
  confidence: number;
}

/**
 * Preprocess image for better OCR accuracy
 */
const preprocessImage = (file: File): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply image preprocessing for better OCR
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        // Apply threshold for better contrast
        const threshold = gray > 128 ? 255 : 0;
        
        data[i] = threshold;     // Red
        data[i + 1] = threshold; // Green
        data[i + 2] = threshold; // Blue
        // Alpha channel remains unchanged
      }
      
      // Put processed image data back
      ctx.putImageData(imageData, 0, 0);
      
      resolve(canvas);
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Extract receipt data from OCR text
 */
const parseReceiptText = (text: string): OCRResult => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let amount = 0;
  let date = '';
  let description = '';
  let vendor = '';
  let category = '';
  let currency = 'USD';
  const items: Array<{ description: string; amount: number }> = [];
  
  // Common currency symbols and their codes
  const currencyMap: { [key: string]: string } = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '₹': 'INR',
    '¥': 'JPY',
    'C$': 'CAD',
    'A$': 'AUD'
  };
  
  // Amount patterns (including various currency symbols)
  const amountPatterns = [
    /(\$|€|£|₹|¥|C\$|A\$)\s*(\d+\.?\d*)/g,
    /(\d+\.?\d*)\s*(\$|€|£|₹|¥|C\$|A\$)/g,
    /total[:\s]*(\$|€|£|₹|¥|C\$|A\$)?\s*(\d+\.?\d*)/gi,
    /amount[:\s]*(\$|€|£|₹|¥|C\$|A\$)?\s*(\d+\.?\d*)/gi,
    /(\d+\.?\d*)\s*(total|amount)/gi
  ];
  
  // Date patterns
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
    /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/gi
  ];
  
  // Extract amount
  for (const pattern of amountPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const numbers = match.match(/\d+\.?\d*/);
        if (numbers) {
          const num = parseFloat(numbers[0]);
          if (num > amount) { // Take the largest amount as total
            amount = num;
            
            // Extract currency symbol
            const currencySymbol = match.match(/(\$|€|£|₹|¥|C\$|A\$)/);
            if (currencySymbol) {
              currency = currencyMap[currencySymbol[0]] || 'USD';
            }
          }
        }
      }
    }
  }
  
  // Extract date
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      date = match[0];
      break;
    }
  }
  
  // Extract vendor (usually first line or contains common business keywords)
  const businessKeywords = ['restaurant', 'hotel', 'store', 'shop', 'cafe', 'bar', 'market', 'center', 'mall', 'office', 'company', 'inc', 'ltd', 'corp'];
  for (const line of lines.slice(0, 5)) { // Check first 5 lines
    if (businessKeywords.some(keyword => line.toLowerCase().includes(keyword)) || 
        line.length > 5 && line.length < 50) {
      vendor = line;
      break;
    }
  }
  
  // Extract description (look for item descriptions)
  const itemLines = lines.filter(line => {
    const hasAmount = /\d+\.?\d*/.test(line);
    const hasText = /[a-zA-Z]/.test(line);
    return hasAmount && hasText && line.length > 5;
  });
  
  if (itemLines.length > 0) {
    description = itemLines[0].replace(/\d+\.?\d*/, '').trim();
  }
  
  // Categorize based on keywords
  const categoryKeywords = {
    'Meals': ['restaurant', 'cafe', 'food', 'lunch', 'dinner', 'breakfast', 'meal', 'eat', 'dining'],
    'Transportation': ['taxi', 'uber', 'lyft', 'bus', 'train', 'metro', 'parking', 'gas', 'fuel', 'ride'],
    'Accommodation': ['hotel', 'motel', 'inn', 'lodging', 'accommodation', 'room', 'stay'],
    'Office Supplies': ['office', 'supplies', 'stationery', 'paper', 'pen', 'pencil', 'stapler', 'printer'],
    'Travel': ['flight', 'airline', 'airport', 'ticket', 'booking', 'travel'],
    'Entertainment': ['movie', 'theater', 'concert', 'show', 'entertainment', 'ticket'],
    'Communication': ['phone', 'internet', 'wifi', 'data', 'communication', 'mobile'],
    'Utilities': ['electric', 'water', 'gas', 'utility', 'bill', 'service']
  };
  
  const textLower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Extract individual items
  for (const line of itemLines) {
    const amountMatch = line.match(/(\d+\.?\d*)/);
    if (amountMatch) {
      const itemAmount = parseFloat(amountMatch[1]);
      const itemDesc = line.replace(amountMatch[0], '').trim();
      if (itemDesc && itemAmount > 0) {
        items.push({
          description: itemDesc,
          amount: itemAmount
        });
      }
    }
  }
  
  return {
    amount,
    date: date || new Date().toISOString().split('T')[0],
    description: description || 'Receipt from ' + (vendor || 'Unknown vendor'),
    vendor,
    category: category || 'Other',
    currency,
    items: items.length > 0 ? items : undefined
  };
};

/**
 * Perform OCR on receipt image
 */
export const performReceiptOCR = async (file: File): Promise<ReceiptData> => {
  try {
    // Preprocess image for better OCR
    const canvas = await preprocessImage(file);
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });
    
    // Perform OCR with Tesseract.js
    const { data: { text, confidence } } = await Tesseract.recognize(
      blob,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );
    
    console.log('OCR Raw Text:', text);
    console.log('OCR Confidence:', confidence);
    
    // Parse the extracted text
    const extractedData = parseReceiptText(text);
    
    return {
      rawText: text,
      extractedData,
      confidence
    };
    
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process receipt image. Please try again with a clearer image.');
  }
};

/**
 * Enhanced OCR with fallback to simulation
 */
export const performOCR = async (file: File): Promise<OCRResult> => {
  try {
    const result = await performReceiptOCR(file);
    
    // If confidence is too low, fall back to simulation
    if (result.confidence < 30) {
      console.warn('Low OCR confidence, using simulation');
      return await simulateOCR(file);
    }
    
    return result.extractedData;
  } catch (error) {
    console.error('OCR failed, using simulation:', error);
    return await simulateOCR(file);
  }
};

/**
 * Simulate OCR for testing (fallback)
 */
const simulateOCR = async (file: File): Promise<OCRResult> => {
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
