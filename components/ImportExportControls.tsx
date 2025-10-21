'use client';

import { useRef } from 'react';
import type { Expense, Holdings } from '@/lib/types';

interface ImportExportControlsProps {
  holdings: Holdings;
  expenses: Expense[];
  onImport: (data: { holdings?: Holdings; expenses?: Expense[] }) => void;
}

export function ImportExportControls({ holdings, expenses, onImport }: ImportExportControlsProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      holdings,
      expenses,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'irt-portfolio-backup.json';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      onImport({ holdings: data.holdings, expenses: data.expenses });
    } catch (error) {
      console.error('Failed to import data', error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-lg shadow-slate-900/5 transition-colors dark:bg-slate-900 dark:shadow-black/20">
      <button
        type="button"
        onClick={handleExport}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        خروجی JSON
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-2xl border border-emerald-400 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-emerald-400/60 dark:text-emerald-200"
      >
        ورود JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImport}
      />
      <p className="text-xs text-slate-500 dark:text-slate-400">پشتیبان‌گیری و بازیابی اطلاعات دارایی و هزینه‌ها</p>
    </div>
  );
}
