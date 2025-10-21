import { useCallback, useEffect, useState } from 'react';
import type { Currency, Holdings } from '@/lib/types';
import { readFromStorage, writeToStorage } from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabaseClient';

const STORAGE_KEY = 'holdings:v1';
const DEFAULT_HOLDINGS: Holdings = {
  IRT: 0,
  USD: 0,
  EUR: 0,
  USDT: 0,
};

const HOLDINGS_ROW_ID = 'default';

export function useHoldings() {
  const [holdings, setHoldings] = useState<Holdings>(DEFAULT_HOLDINGS);

  useEffect(() => {
    const stored = readFromStorage<Holdings>(STORAGE_KEY);
    if (stored) {
      setHoldings({ ...DEFAULT_HOLDINGS, ...stored });
    }

    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data, error } = await client
        .from('holdings')
        .select('id,irt,usd,eur,usdt')
        .eq('id', HOLDINGS_ROW_ID)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error('دریافت دارایی‌ها از Supabase با خطا مواجه شد', error);
        return;
      }
      if (!data) {
        return;
      }
      const next: Holdings = {
        IRT: Number(data.irt ?? 0) || 0,
        USD: Number(data.usd ?? 0) || 0,
        EUR: Number(data.eur ?? 0) || 0,
        USDT: Number(data.usdt ?? 0) || 0,
      };
      setHoldings(next);
      writeToStorage(STORAGE_KEY, next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const syncHoldings = useCallback((next: Holdings) => {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }
    void (async () => {
      const { error } = await client.from('holdings').upsert({
        id: HOLDINGS_ROW_ID,
        irt: next.IRT,
        usd: next.USD,
        eur: next.EUR,
        usdt: next.USDT,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('ذخیره‌سازی دارایی‌ها در Supabase با خطا مواجه شد', error);
      }
    })();
  }, []);

  const updateHolding = useCallback((currency: Currency, value: number) => {
    setHoldings((prev) => {
      const next = { ...prev, [currency]: value } as Holdings;
      writeToStorage(STORAGE_KEY, next);
      syncHoldings(next);
      return next;
    });
  }, [syncHoldings]);

  const resetHoldings = useCallback(() => {
    setHoldings(DEFAULT_HOLDINGS);
    writeToStorage(STORAGE_KEY, DEFAULT_HOLDINGS);
    syncHoldings(DEFAULT_HOLDINGS);
  }, [syncHoldings]);

  const replaceHoldings = useCallback((next: Holdings) => {
    setHoldings(next);
    writeToStorage(STORAGE_KEY, next);
    syncHoldings(next);
  }, [syncHoldings]);

  return {
    holdings,
    updateHolding,
    resetHoldings,
    replaceHoldings,
  } as const;
}
