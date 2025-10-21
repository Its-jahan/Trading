import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Expense } from '@/lib/types';
import { readFromStorage, writeToStorage } from '@/lib/storage';

const STORAGE_KEY = 'expenses:v1';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lastRemoved, setLastRemoved] = useState<Expense | null>(null);

  useEffect(() => {
    const stored = readFromStorage<Expense[]>(STORAGE_KEY);
    if (stored) {
      setExpenses(stored);
    }
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    setExpenses((current) => {
      const next = [expense, ...current];
      writeToStorage(STORAGE_KEY, next);
      return next;
    });
    setLastRemoved(null);
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpenses((current) => {
      const toRemove = current.find((item) => item.id === id) ?? null;
      const remaining = current.filter((item) => item.id !== id);
      writeToStorage(STORAGE_KEY, remaining);
      setLastRemoved(toRemove);
      return remaining;
    });
  }, []);

  const restoreExpense = useCallback(() => {
    setLastRemoved((removed) => {
      if (!removed) {
        return null;
      }
      setExpenses((current) => {
        const next = [removed, ...current];
        writeToStorage(STORAGE_KEY, next);
        return next;
      });
      return null;
    });
  }, []);

  const replaceExpenses = useCallback((incoming: Expense[]) => {
    setExpenses(incoming);
    writeToStorage(STORAGE_KEY, incoming);
    setLastRemoved(null);
  }, []);

  const clearExpenses = useCallback(() => {
    setExpenses([]);
    writeToStorage(STORAGE_KEY, []);
    setLastRemoved(null);
  }, []);

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
