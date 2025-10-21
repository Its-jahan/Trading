import type { Currency, Rates } from './types';

export function formatNumberInput(value: string): string {
  return value.replace(/[^\d.]/g, '').replace(/(\.)(?=.*\.)/g, '');
}

export function toIRT(amount: number, currency: Currency, rates: Rates | undefined): number {
  if (!rates) {
    return currency === 'IRT' ? amount : 0;
  }

  switch (currency) {
    case 'IRT':
      return amount;
    case 'USD':
      return amount * rates.usdIRT;
    case 'EUR':
      return amount * rates.eurIRT;
    case 'USDT':
      return amount * rates.usdtIRT;
    default:
      return amount;
  }
}

export function clampNonNegative(value: number): number {
  if (Number.isNaN(value) || value < 0) {
    return 0;
  }
  return value;
}
