import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(request) {
  try {
    const { nombre, email, telefono, mensaje } = await request.json();

    const nombreClean = nombre?.trim() || '';
    const emailClean = email?.trim().toLowerCase() || '';
    const mensajeClean = mensaje?.trim() || '';

    if (!nombreClean || nombreClean.length < 3) {
      return NextResponse.json({ error: 'El nombre debe tener al menos 3 caracteres.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    if (!mensajeClean || mensajeClean.length < 10) {
      return NextResponse.json({ error: 'El mensaje debe tener al menos 10 caracteres.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (supabase) {
      await supabase.from('contact_messages').insert({
        nombre: nombreClean,
        email: emailClean,
        telefono: telefono?.trim() || null,
        mensaje: mensajeClean
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'No se pudo enviar el mensaje. Intentá nuevamente.' }, { status: 500 });
  }
}
