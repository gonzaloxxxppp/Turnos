import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseKey, isSupabaseConfigured } from './config';

const supabaseUrl = getSupabaseUrl();
const supabaseKey = getSupabaseKey();

/**
 * Cliente SSR para navegador (maneja cookies de autenticación automáticamente)
 */
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseKey);
};

/**
 * Instancia singleton para uso directo en componentes y servicios del cliente
 */
export const supabase = isSupabaseConfigured()
  ? createSupabaseClient(supabaseUrl, supabaseKey)
  : null;