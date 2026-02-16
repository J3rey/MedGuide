// Quick test to verify Supabase connection
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('[Supabase Test] Testing connection...');

  try {
    // Try to count rows
    const { count, error } = await supabase
      .from('drugs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[Supabase Test] Connection ERROR:', error);
      console.error('[Supabase Test] Error message:', error.message);
      console.error('[Supabase Test] Error details:', error.details);
      console.error('[Supabase Test] Error hint:', error.hint);
      return false;
    }

    console.log('[Supabase Test] ✅ Connected! Total drugs in DB:', count);

    // Try to fetch one drug
    const { data, error: fetchError } = await supabase
      .from('drugs')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('[Supabase Test] Fetch ERROR:', fetchError);
      return false;
    }

    console.log('[Supabase Test] Sample drug:', data?.[0]?.drug_name);
    return true;
  } catch (err) {
    console.error(
      '[Supabase Test] Exception:',
      err instanceof Error ? err.message : String(err)
    );
    return false;
  }
}
