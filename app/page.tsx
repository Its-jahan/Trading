'use client';

import { useMemo } from 'react';
import { ExpensesForm } from '@/components/ExpensesForm';
import { ExpensesTable } from '@/components/ExpensesTable';
import { HoldingsForm } from '@/components/HoldingsForm';
import { ImportExportControls } from '@/components/ImportExportControls';
import { SummaryCards } from '@/components/SummaryCards';
import { UpdateBanner } from '@/components/UpdateBanner';
import { useExpenses } from '@/hooks/useExpenses';
import { useHoldings } from '@/hooks/useHoldings';
import { useRates } from '@/hooks/useRates';
import { toIRT } from '@/lib/conversions';
import type { Currency, Expense, Holdings } from '@/lib/types';

const CURRENCY_ORDER: Currency[] = ['IRT', 'USD', 'EUR', 'USDT'];

function sanitizeHoldings(holdings: Partial<Holdings> | undefined): Holdings | null {
  if (!holdings) return null;
  const next: Holdings = {
    IRT: Number(holdings.IRT ?? 0),
    USD: Number(holdings.USD ?? 0),
    EUR: Number(holdings.EUR ?? 0),
    USDT: Number(holdings.USDT ?? 0),
  };
  if (Object.values(next).some((value) => Number.isNaN(value) || value < 0)) {
    return null;
  }
  return next;
}

function sanitizeExpenses(expenses: unknown): Expense[] | null {
  if (!Array.isArray(expenses)) {
    return null;
  }
  const mapped = expenses
    .map((entry) => {
      const candidate = entry as Partial<Expense>;
      const amount = Number(candidate.amount ?? 0);
      const irtValue = Number(candidate.irtValue ?? 0);
      const createdAt = typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString();
      const currency = candidate.currency;
      if (typeof candidate.id !== 'string') return null;
      if (!['IRT', 'USD', 'EUR', 'USDT'].includes(currency as string)) return null;
      if (Number.isNaN(amount) || amount < 0) return null;
      if (Number.isNaN(irtValue) || irtValue < 0) return null;
      return {
        id: candidate.id,
        amount,
        currency: currency as Currency,
        category: typeof candidate.category === 'string' ? candidate.category : 'سایر',
        note: typeof candidate.note === 'string' ? candidate.note : undefined,
        createdAt,
        irtValue,
      } satisfies Expense;
    })
    .filter((item): item is Expense => Boolean(item));
  return mapped.length ? mapped : null;
}

export default function HomePage() {
  const { data: rates, error } = useRates();
  const { holdings, updateHolding, replaceHoldings } = useHoldings();
  const { expenses, addExpense, removeExpense, restoreExpense, replaceExpenses, lastRemoved, totalExpenses } = useExpenses();

  const grossAssets = useMemo(() => {
    return CURRENCY_ORDER.reduce((total, currency) => {
      const value = holdings[currency];
      return total + toIRT(value, currency, rates);
    }, 0);
  }, [holdings, rates]);

  const bannerVisible = Boolean(rates?.stale || error);
  const bannerMessage = error ? 'نرخ‌های جدید در دسترس نیستند؛ تلاش برای اتصال مجدد...' : undefined;

  const handleImport = (data: { holdings?: Holdings; expenses?: Expense[] }) => {
    const normalizedHoldings = sanitizeHoldings(data.holdings);
    if (normalizedHoldings) {
      replaceHoldings(normalizedHoldings);
    }
    const normalizedExpenses = sanitizeExpenses(data.expenses);
    if (normalizedExpenses) {
      replaceExpenses(normalizedExpenses);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">کیف‌پول من (IRT)</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          مدیریت دارایی‌ها و هزینه‌ها با تبدیل خودکار دلار، یورو و تتر به تومان با استفاده از نرخ‌های لحظه‌ای ناوَسان.
        </p>
      </header>

      <UpdateBanner visible={bannerVisible} message={bannerMessage} />

      <SummaryCards grossAssets={grossAssets} totalExpenses={totalExpenses} rates={rates} />

      <HoldingsForm holdings={holdings} rates={rates} onChange={updateHolding} />

      <ExpensesForm rates={rates} onAdd={addExpense} />

      <ExpensesTable expenses={expenses} onDelete={removeExpense} onUndo={restoreExpense} lastRemoved={lastRemoved} />

      <ImportExportControls holdings={holdings} expenses={expenses} onImport={handleImport} />
    </main>
  );
}
