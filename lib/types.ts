export type Currency = 'IRT' | 'USD' | 'EUR' | 'USDT';

export interface Rates {
  usdIRT: number;
  eurIRT: number;
  usdtIRT: number;
  lastUpdated: string;
  stale?: boolean;
  error?: string;
}

export interface Holdings {
  IRT: number;
  USD: number;
  EUR: number;
  USDT: number;
}

export interface Expense {
  id: string;
  amount: number;
  currency: Currency;
  category: string;
  note?: string;
  createdAt: string;
  irtValue: number;
}
