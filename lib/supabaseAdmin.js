import { createClient } from '@supabase/supabase-js';

let cachedClient = null;
let cachedClientUrl = null;

function normalizeSupabaseUrl(rawUrl) {
  const value = rawUrl?.trim();

  if (!value) {
    return '';
  }

  const projectUrlMatch = value.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i);

  if (projectUrlMatch) {
    return projectUrlMatch[0];
  }

  const dashboardProjectMatch = value.match(/supabase\.com\/(?:dashboard\/)?project\/([a-z0-9-]+)/i);

  if (dashboardProjectMatch?.[1]) {
    return `https://${dashboardProjectMatch[1]}.supabase.co`;
  }

  if (value.includes('=')) {
    return value.split('=').slice(1).join('=').trim();
  }

  return value;
}

function getSupabaseConfig() {
  const rawSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      reason: 'missing_supabase_config',
      message: 'Falta configurar SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.'
    };
  }

  try {
    const url = new URL(supabaseUrl);
    const hasProjectHost = url.hostname.endsWith('.supabase.co');
    const hasOnlyRootPath = url.pathname === '/' || url.pathname === '';

    if (url.protocol !== 'https:' || !hasProjectHost || !hasOnlyRootPath) {
      return {
        reason: 'invalid_supabase_url',
        message:
          'SUPABASE_URL debe ser la Project URL de Supabase con formato https://xxxxx.supabase.co. No uses la URL del dashboard ni una API key.'
      };
    }

    return {
      supabaseUrl: url.origin,
      serviceRoleKey
    };
  } catch {
    return {
      reason: 'invalid_supabase_url',
      message:
        'SUPABASE_URL debe ser una URL valida con formato https://xxxxx.supabase.co.'
    };
  }
}

function getSupabaseAdminResult() {
  const config = getSupabaseConfig();

  if (!config.supabaseUrl || !config.serviceRoleKey) {
    return {
      client: null,
      reason: config.reason,
      message: config.message
    };
  }

  if (!cachedClient || cachedClientUrl !== config.supabaseUrl) {
    cachedClient = createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    cachedClientUrl = config.supabaseUrl;
  }

  return { client: cachedClient };
}

export function getSupabaseAdmin() {
  return getSupabaseAdminResult().client;
}

export async function saveOrder(order) {
  const { client: supabase, reason, message } = getSupabaseAdminResult();

  if (!supabase) {
    return { saved: false, skipped: true, reason, error: message };
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
  const { client: supabase, reason, message } = getSupabaseAdminResult();

  if (!supabase) {
    return { saved: false, skipped: true, reason, error: message };
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
