import { createClient } from '@supabase/supabase-js';

let browserClient = null;

function getBrowserSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  return { supabaseUrl, publishableKey };
}

export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  const config = getBrowserSupabaseConfig();

  if (!config) {
    return null;
  }

  browserClient = createClient(config.supabaseUrl, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return browserClient;
}
