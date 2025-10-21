'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Currency, Expense, Rates } from '@/lib/types';
import { clampNonNegative, formatNumberInput, toIRT } from '@/lib/conversions';

const CURRENCIES: Array<{ value: Currency; label: string }> = [
  { value: 'IRT', label: 'تومان (IRT)' },
  { value: 'USD', label: 'دلار (USD)' },
  { value: 'EUR', label: 'یورو (EUR)' },
  { value: 'USDT', label: 'تتر (USDT)' },
];

const CATEGORIES = ['هزینه زندگی', 'سرمایه‌گذاری', 'تفریح', 'حمل‌ونقل', 'سایر'];

interface ExpensesFormProps {
  rates?: Rates;
  onAdd: (expense: Expense) => void;
}

const nowLocal = () => new Date().toISOString().slice(0, 16);

export function ExpensesForm({ rates, onAdd }: ExpensesFormProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('IRT');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [datetime, setDatetime] = useState(nowLocal());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDatetime(nowLocal());
  }, []);

  const canSubmit = useMemo(() => {
    if (!rates && currency !== 'IRT') {
      return false;
    }
    const parsed = Number(formatNumberInput(amount));
    return parsed > 0;
  }, [amount, currency, rates]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitized = formatNumberInput(amount);
    const numeric = clampNonNegative(Number(sanitized));
    if (numeric <= 0) {
      setError('مبلغ معتبر وارد کنید');
      return;
    }
    if (!rates && currency !== 'IRT') {
      setError('نرخ‌های تبدیل در دسترس نیستند');
      return;
    }

    const irtValue = toIRT(numeric, currency, rates);
    const expense: Expense = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      amount: numeric,
      currency,
      category,
      note: note.trim() || undefined,
      createdAt: new Date(datetime || nowLocal()).toISOString(),
      irtValue,
    };

    onAdd(expense);
    setAmount('');
    setNote('');
    setDatetime(nowLocal());
    setError(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5 transition-colors dark:bg-slate-900 dark:shadow-black/20"
    >
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">ثبت هزینه جدید</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">هزینه‌ها به نرخ لحظه ثبت می‌شوند</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">مبلغ</span>
          <input
            dir="ltr"
            inputMode="decimal"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 shadow-inner transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="0"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">ارز</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as Currency)}
          >
            {CURRENCIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">دسته‌بندی</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">تاریخ و ساعت</span>
          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={datetime}
            onChange={(event) => setDatetime(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">توضیحات</span>
          <textarea
            className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="اختیاری"
          />
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-amber-600">{error}</p> : null}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          افزودن هزینه
        </button>
        {currency !== 'IRT' && !rates ? (
          <span className="text-xs text-amber-600">برای تبدیل این ارز باید نرخ‌ها به‌روزرسانی شوند.</span>
        ) : null}
      </div>
    </form>
  );
}
