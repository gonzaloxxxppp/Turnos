/**
 * Helper para verificar si las credenciales de Supabase están configuradas en el entorno
 */
export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  );
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) return false;
  if (url.includes('tu-proyecto') || key.includes('tu-anon-key')) return false;

  return true;
}
