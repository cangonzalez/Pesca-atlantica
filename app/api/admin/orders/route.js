import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const ORDER_SELECT = [
  'id',
  'external_reference',
  'mercadopago_preference_id',
  'mercadopago_payment_id',
  'status',
  'status_detail',
  'buyer_name',
  'buyer_email',
  'buyer_phone',
  'delivery_address',
  'delivery_notes',
  'currency',
  'shipping_cost',
  'total_amount',
  'items',
  'payment_method_id',
  'payment_type_id',
  'created_at',
  'updated_at'
].join(', ');

function getSupabaseOrError() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      supabase: null,
      response: NextResponse.json(
        { error: 'Falta configurar Supabase para usar el panel admin.' },
        { status: 500 }
      )
    };
  }

  return { supabase };
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : value;
}

export async function GET(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, response } = getSupabaseOrError();

  if (!supabase) {
    return response;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, response } = getSupabaseOrError();

  if (!supabase) {
    return response;
  }

  const body = await request.json();
  const id = cleanText(body.id);

  if (!id) {
    return NextResponse.json({ error: 'Falta el id del pedido.' }, { status: 400 });
  }

  const update = {
    status: cleanText(body.status) || 'preference_created',
    status_detail: cleanText(body.status_detail) || null,
    buyer_phone: cleanText(body.buyer_phone) || null,
    delivery_address: cleanText(body.delivery_address) || null,
    delivery_notes: cleanText(body.delivery_notes) || null
  };

  const { data, error } = await supabase
    .from('orders')
    .update(update)
    .eq('id', id)
    .select(ORDER_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
