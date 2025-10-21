import { useCallback, useEffect, useState } from 'react';
import type { Currency, Holdings } from '@/lib/types';
import { readFromStorage, writeToStorage } from '@/lib/storage';

const STORAGE_KEY = 'holdings:v1';
const DEFAULT_HOLDINGS: Holdings = {
  IRT: 0,
  USD: 0,
  EUR: 0,
  USDT: 0,
};

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holdings>(DEFAULT_HOLDINGS);

  useEffect(() => {
    const stored = readFromStorage<Holdings>(STORAGE_KEY);
    if (stored) {
      setHoldings({ ...DEFAULT_HOLDINGS, ...stored });
    }
  }, []);

  const updateHolding = useCallback((currency: Currency, value: number) => {
    setHoldings((prev) => {
      const next = { ...prev, [currency]: value } as Holdings;
      writeToStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const resetHoldings = useCallback(() => {
    setHoldings(DEFAULT_HOLDINGS);
    writeToStorage(STORAGE_KEY, DEFAULT_HOLDINGS);
  }, []);

  const replaceHoldings = useCallback((next: Holdings) => {
    setHoldings(next);
    writeToStorage(STORAGE_KEY, next);
  }, []);

  return {
    holdings,
    updateHolding,
    resetHoldings,
    replaceHoldings,
  } as const;
}
