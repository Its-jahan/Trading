'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Holdings, Rates, Currency } from '@/lib/types';
import { clampNonNegative, formatNumberInput, toIRT } from '@/lib/conversions';
import { formatGeneralCurrency, formatIRT } from '@/lib/format';

interface HoldingsFormProps {
  holdings: Holdings;
  rates?: Rates;
  onChange: (currency: Currency, value: number) => void;
}

type InputState = Record<Currency, string>;

const FIELD_META: Array<{
  key: Currency;
  label: string;
  decimals: number;
}> = [
  { key: 'USDT', label: 'تتر (USDT)', decimals: 2 },
  { key: 'USD', label: 'دلار (USD)', decimals: 2 },
  { key: 'EUR', label: 'یورو (EUR)', decimals: 2 },
  { key: 'IRT', label: 'تومان (IRT)', decimals: 0 },
];

function formatValue(value: number, decimals: number) {
  if (decimals === 0) {
    return formatIRT(value);
  }
  return formatGeneralCurrency(value);
}

export function HoldingsForm({ holdings, rates, onChange }: HoldingsFormProps) {
  const [inputs, setInputs] = useState<InputState>({
    IRT: '0',
    USD: '0',
    EUR: '0',
    USDT: '0',
  });

  useEffect(() => {
    setInputs({
      IRT: formatValue(holdings.IRT, 0),
      USD: formatValue(holdings.USD, 2),
      EUR: formatValue(holdings.EUR, 2),
      USDT: formatValue(holdings.USDT, 2),
    });
  }, [holdings]);

  const totalIRT = useMemo(() => {
    return (['IRT', 'USD', 'EUR', 'USDT'] as Currency[]).reduce((total, currency) => {
      const value = holdings[currency];
      return total + toIRT(value, currency, rates);
    }, 0);
  }, [holdings, rates]);

  const handleInputChange = (currency: Currency, rawValue: string) => {
    const sanitized = formatNumberInput(rawValue);
    const parsed = clampNonNegative(Number(sanitized));
    onChange(currency, parsed);
  };

  const handleBlur = (currency: Currency, decimals: number) => {
    setInputs((prev) => ({
      ...prev,
      [currency]: formatValue(holdings[currency], decimals),
    }));
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5 transition-colors dark:bg-slate-900 dark:shadow-black/20">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">دارایی‌ها</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">ارزش کلی به تومان با نرخ‌های لحظه‌ای</p>
        </div>
        <div className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          مجموع: {formatIRT(totalIRT)} تومان
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELD_META.map(({ key, label, decimals }) => (
          <label key={key} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
            <input
              dir="ltr"
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 shadow-inner transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              value={inputs[key] ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                setInputs((prev) => ({ ...prev, [key]: value }));
                handleInputChange(key, value);
              }}
              onBlur={() => handleBlur(key, decimals)}
              placeholder="0"
            />
          </label>
        ))}
      </div>
    </section>
  );
}
