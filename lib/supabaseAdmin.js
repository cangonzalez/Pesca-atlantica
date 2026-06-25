import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return cachedClient;
}

export async function saveOrder(order) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { saved: false, skipped: true, reason: 'missing_supabase_config' };
  }

  const { error } = await supabase
    .from('orders')
    .upsert(order, { onConflict: 'external_reference' });

  if (error) {
    console.error('Supabase order save failed:', error);
    return { saved: false, error: error.message };
  }

  return { saved: true };
}

export async function updateOrderPayment(externalReference, payment) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { saved: false, skipped: true, reason: 'missing_supabase_config' };
  }

  const update = {
    mercadopago_payment_id: payment?.id ? String(payment.id) : null,
    status: payment?.status || 'payment_received',
    status_detail: payment?.status_detail || null,
    payment_method_id: payment?.payment_method_id || null,
    payment_type_id: payment?.payment_type_id || null,
    raw_payment: payment || null
  };

  const { error } = await supabase
    .from('orders')
    .update(update)
    .eq('external_reference', externalReference);

  if (error) {
    console.error('Supabase payment update failed:', error);
    return { saved: false, error: error.message };
  }

  return { saved: true };
}
