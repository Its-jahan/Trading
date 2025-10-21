'use client';

import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
import 'dayjs/locale/fa';
import { formatGeneralCurrency, formatIRT } from '@/lib/format';
import type { Expense } from '@/lib/types';

dayjs.extend(jalaliday);
dayjs.calendar('jalali');
dayjs.locale('fa');

interface ExpensesTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUndo: () => void;
  lastRemoved: Expense | null;
}

function formatDate(value: string) {
  return dayjs(value).calendar('jalali').locale('fa').format('YYYY/MM/DD - HH:mm:ss');
}

export function ExpensesTable({ expenses, onDelete, onUndo, lastRemoved }: ExpensesTableProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-900/5 transition-colors dark:bg-slate-900 dark:shadow-black/20">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">دفترچه هزینه‌ها</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">ثبت و مدیریت هزینه‌های روزانه</p>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-right text-sm dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">تاریخ</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">دسته</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">مبلغ اصلی</th>
              <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">معادل تومان</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {expenses.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
                  هنوز هزینه‌ای ثبت نشده است.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(expense.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">{expense.category}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                    {formatGeneralCurrency(expense.amount)}
                    <span className="mr-1 text-xs text-slate-500">{expense.currency}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {formatIRT(expense.irtValue)} تومان
                  </td>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="rounded-xl border border-transparent bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/60"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {lastRemoved ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-100 px-4 py-3 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <span className="text-sm">یک هزینه حذف شد.</span>
          <button
            onClick={onUndo}
            className="rounded-xl border border-amber-300 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-white dark:border-amber-500/40 dark:bg-transparent dark:text-amber-200"
          >
            بازگردانی
          </button>
        </div>
      ) : null}
    </section>
  );
}
