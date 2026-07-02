import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const MESSAGE_SELECT = 'id, nombre, email, telefono, mensaje, status, is_read, created_at, updated_at';

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
    .from('contact_messages')
    .select(MESSAGE_SELECT)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [] });
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
  const id = body.id?.trim();

  if (!id) {
    return NextResponse.json({ error: 'Falta el id del mensaje.' }, { status: 400 });
  }

  const update = {
    status: body.status === 'archived' ? 'archived' : 'read',
    is_read: true
  };

  const { data, error } = await supabase
    .from('contact_messages')
    .update(update)
    .eq('id', id)
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}

export async function DELETE(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, response } = getSupabaseOrError();

  if (!supabase) {
    return response;
  }

  const id = new URL(request.url).searchParams.get('id')?.trim();

  if (!id) {
    return NextResponse.json({ error: 'Falta el id del mensaje.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
