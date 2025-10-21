import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Expense } from '@/lib/types';
import { readFromStorage, writeToStorage } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabaseClient';

const STORAGE_KEY = 'expenses:v1';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lastRemoved, setLastRemoved] = useState<Expense | null>(null);

  useEffect(() => {
    const stored = readFromStorage<Expense[]>(STORAGE_KEY);
    if (stored) {
      setExpenses(stored);
    }

    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data, error } = await client
        .from('expenses')
        .select('id,amount,currency,category,note,created_at,irt_value')
        .order('created_at', { ascending: false });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error('دریافت هزینه‌ها از Supabase با خطا مواجه شد', error);
        return;
      }
      if (!data) {
        return;
      }
      const mapped = data
        .map((item) => {
          if (typeof item.id !== 'string' || !item.id) {
            return null;
          }
          const amount = Number(item.amount ?? 0) || 0;
          const irtValue = Number(item.irt_value ?? 0) || 0;
          const currency =
            typeof item.currency === 'string' && ['IRT', 'USD', 'EUR', 'USDT'].includes(item.currency)
              ? (item.currency as Expense['currency'])
              : 'IRT';
          return {
            id: item.id,
            amount,
            currency,
            category: typeof item.category === 'string' ? item.category : 'سایر',
            note: typeof item.note === 'string' && item.note.length ? item.note : undefined,
            createdAt: item.created_at ?? new Date().toISOString(),
            irtValue,
          } as Expense;
        })
        .filter((entry): entry is Expense => Boolean(entry));
      if (mapped.length) {
        setExpenses(mapped);
        writeToStorage(STORAGE_KEY, mapped);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistExpense = useCallback((expense: Expense) => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    void (async () => {
      const { error } = await client.from('expenses').upsert({
        id: expense.id,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        note: expense.note ?? null,
        created_at: expense.createdAt,
        irt_value: expense.irtValue,
      });
      if (error) {
        console.error('ذخیره هزینه در Supabase با خطا مواجه شد', error);
      }
    })();
  }, []);

  const deleteExpense = useCallback((id: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    void (async () => {
      const { error } = await client.from('expenses').delete().eq('id', id);
      if (error) {
        console.error('حذف هزینه از Supabase با خطا مواجه شد', error);
      }
    })();
  }, []);

  const replaceRemoteExpenses = useCallback((list: Expense[]) => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    void (async () => {
      const { error } = await client.from('expenses').delete().neq('id', '');
      if (error) {
        console.error('پاک‌سازی هزینه‌های Supabase با خطا مواجه شد', error);
        return;
      }
      if (!list.length) {
        return;
      }
      const payload = list.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        note: expense.note ?? null,
        created_at: expense.createdAt,
        irt_value: expense.irtValue,
      }));
      const { error: insertError } = await client.from('expenses').upsert(payload);
      if (insertError) {
        console.error('درج هزینه‌های Supabase با خطا مواجه شد', insertError);
      }
    })();
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((current) => {
      const next = [expense, ...current];
      writeToStorage(STORAGE_KEY, next);
      persistExpense(expense);
      return next;
    });
    setLastRemoved(null);
  }, [persistExpense]);

  const removeExpense = useCallback((id: string) => {
    setExpenses((current) => {
      const toRemove = current.find((item) => item.id === id) ?? null;
      const remaining = current.filter((item) => item.id !== id);
      writeToStorage(STORAGE_KEY, remaining);
      setLastRemoved(toRemove);
      deleteExpense(id);
      return remaining;
    });
  }, [deleteExpense]);

  const restoreExpense = useCallback(() => {
    setLastRemoved((removed) => {
      if (!removed) {
        return null;
      }
      setExpenses((current) => {
        const next = [removed, ...current];
        writeToStorage(STORAGE_KEY, next);
        persistExpense(removed);
        return next;
      });
      return null;
    });
  }, [persistExpense]);

  const replaceExpenses = useCallback((incoming: Expense[]) => {
    setExpenses(incoming);
    writeToStorage(STORAGE_KEY, incoming);
    setLastRemoved(null);
    replaceRemoteExpenses(incoming);
  }, [replaceRemoteExpenses]);

  const clearExpenses = useCallback(() => {
    setExpenses([]);
    writeToStorage(STORAGE_KEY, []);
    setLastRemoved(null);
    replaceRemoteExpenses([]);
  }, [replaceRemoteExpenses]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.irtValue, 0),
    [expenses],
  );

  return {
    expenses,
    addExpense,
    removeExpense,
    restoreExpense,
    replaceExpenses,
    clearExpenses,
    lastRemoved,
    totalExpenses,
  } as const;
}
