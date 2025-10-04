import { useState, useEffect } from 'react';
import { convertCurrency, formatCurrency } from '@/lib/currency-converter';

interface ConvertedAmountProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  className?: string;
}

export const ConvertedAmount = ({ 
  amount, 
  fromCurrency, 
  toCurrency, 
  className = '' 
}: ConvertedAmountProps) => {
  const [displayAmount, setDisplayAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const convertAmount = async () => {
      try {
        if (fromCurrency === toCurrency) {
          setDisplayAmount(formatCurrency(amount, toCurrency));
        } else {
          const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
          setDisplayAmount(formatCurrency(convertedAmount, toCurrency));
        }
      } catch (error) {
        // Fallback to original amount if conversion fails
        setDisplayAmount(formatCurrency(amount, fromCurrency));
      } finally {
        setLoading(false);
      }
    };

    convertAmount();
  }, [amount, fromCurrency, toCurrency]);

  if (loading) {
    return <span className={className}>Loading...</span>;
  }

  return <span className={className}>{displayAmount}</span>;
};
