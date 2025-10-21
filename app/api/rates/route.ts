import { NextResponse } from 'next/server';
import type { Rates } from '@/lib/types';

interface NavasanItem {
  value: string | number;
  date?: string;
  time?: string;
  timestamp?: number;
}

interface NavasanResponse {
  usd: NavasanItem;
  eur: NavasanItem;
  usdt: NavasanItem;
}

const NAVASAN_URL = 'http://api.navasan.tech/latest/';
const CACHE_TTL_MS = 60_000;

let cachedRates: Rates | null = null;
let lastFetch = 0;

function toIRT(irr: string | number): number {
  const numeric = Number(irr);
  return Number.isFinite(numeric) ? Math.round(numeric / 10) : 0;
}

function resolveTimestamp(payload: NavasanResponse): string {
  const timestamps = [payload.usd, payload.eur, payload.usdt]
    .map((item) => {
      if (item.timestamp) return item.timestamp * 1000;
      if (item.date && item.time) return Date.parse(`${item.date} ${item.time}`);
      if (item.date) return Date.parse(item.date);
      return null;
    })
    .filter((value): value is number => Boolean(value));
  const latest = timestamps.length ? Math.max(...timestamps) : Date.now();
  return new Date(latest).toISOString();
}

async function fetchFromNavasan(): Promise<Rates> {
  const apiKey = process.env.NAVASAN_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('NAVASAN_API_KEY تعریف نشده است'), { status: 500 });
  }

  const url = `${NAVASAN_URL}?api_key=${apiKey}&item=usd,eur,usdt`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    const error: Error & { status?: number } = new Error('خطا در دریافت نرخ‌ها');
    error.status = response.status;
    throw error;
  }

  const data = (await response.json()) as NavasanResponse;
  const next: Rates = {
    usdIRT: toIRT(data.usd.value),
    eurIRT: toIRT(data.eur.value),
    usdtIRT: toIRT(data.usdt.value),
    lastUpdated: resolveTimestamp(data),
  };
  return next;
}

export async function GET() {
  const now = Date.now();
  if (cachedRates && now - lastFetch < CACHE_TTL_MS) {
    return NextResponse.json(cachedRates);
  }

  try {
    const fresh = await fetchFromNavasan();
    cachedRates = fresh;
    lastFetch = Date.now();
    return NextResponse.json(fresh);
  } catch (error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    const message = (error as Error).message ?? 'خطای ناشناخته';

    if (cachedRates) {
      return NextResponse.json(
        {
          ...cachedRates,
          stale: true,
          error: message,
        },
        { status: 200 },
      );
    }

    const safeStatus = [401, 422, 429, 503].includes(status) ? status : 500;
    return NextResponse.json({ message }, { status: safeStatus });
  }
}
