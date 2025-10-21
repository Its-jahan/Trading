'use client';

import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import 'dayjs/locale/fa';
import { formatIRT } from '@/lib/format';
import type { Rates } from '@/lib/types';

dayjs.extend(jalaliday);
dayjs.calendar('jalali');
dayjs.locale('fa');

interface SummaryCardsProps {
  grossAssets: number;
  totalExpenses: number;
  rates?: Rates;
}

export function SummaryCards({ grossAssets, totalExpenses, rates }: SummaryCardsProps) {
  const remaining = Math.max(0, grossAssets - totalExpenses);
  const lastUpdated = rates
    ? dayjs(rates.lastUpdated).calendar('jalali').locale('fa').format('YYYY/MM/DD - HH:mm:ss')
    : '---';

  const chips = [
    { label: 'موجودی کل (IRT)', value: formatIRT(grossAssets) },
    { label: 'جمع هزینه‌ها', value: formatIRT(totalExpenses) },
    { label: 'باقیمانده', value: formatIRT(remaining) },
  ];

  return (
    <section className="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-500/90 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-500/40">
      <header className="mb-6">
        <h2 className="text-lg font-semibold">خلاصه وضعیت</h2>
        <p className="text-sm text-emerald-100">نمای کلی از دارایی و هزینه‌ها</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {chips.map((chip) => (
          <div key={chip.label} className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs font-medium text-emerald-100">{chip.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight">{chip.value}</p>
          </div>
        ))}
      </div>
      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100">
        <span>آخرین به‌روزرسانی نرخ‌ها: {lastUpdated}</span>
        {rates?.stale ? <span className="rounded-full bg-amber-500/40 px-3 py-1 text-amber-50">داده موقت</span> : null}
      </footer>
    </section>
  );
}
