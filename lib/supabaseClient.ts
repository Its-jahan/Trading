import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function readEnv(name: string): string | undefined {
  if (typeof process === 'undefined') {
    return undefined;
  }
  return process.env[name];
}

export function getSupabaseClient(): SupabaseClient | null {
  const url = readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
      console.warn('Supabase پیکربندی نشده است. از localStorage استفاده می‌شود.');
    }
    return null;
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(readEnv('NEXT_PUBLIC_SUPABASE_URL') && readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}
