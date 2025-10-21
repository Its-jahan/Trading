import useSWR from 'swr';
import type { Rates } from '@/lib/types';

async function fetcher(url: string): Promise<Rates> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error: Error & { status?: number } = new Error(
      errorBody?.message || 'Failed to دریافت نرخ‌ها',
    );
    error.status = response.status;
    throw error;
  }
  return (await response.json()) as Rates;
}

export function useRates() {
  return useSWR<Rates>('/api/rates', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      const status = (error as Error & { status?: number }).status;
      if (status === 401 || status === 422) {
        return;
      }
      const delay = Math.min(60_000, 1_000 * 2 ** retryCount);
      setTimeout(() => revalidate({ retryCount }), delay);
    },
  });
}
