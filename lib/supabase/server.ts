import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseUrl, getSupabaseKey, isSupabaseConfigured } from './config';

/**
 * Cliente para Server Components con manejo de cookies
 */
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabaseKey();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // In Server Components setAll may fail silently
        }
      },
    },
  });
};

/**
 * Cliente Supabase para Route Handlers (API routes de backend)
 */
export function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = getSupabaseUrl();
  // Si existe service role key se prefiere para backend, sino la anon/publishable key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseKey();

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}