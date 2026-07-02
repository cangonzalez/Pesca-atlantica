import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/adminAuth';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { formatProduct } from '../../../../lib/productCatalog';

export const dynamic = 'force-dynamic';

const PRODUCT_SELECT = 'id, nombre, precio, categoria, imagen, descripcion, precio_por, activo, created_at, updated_at';

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
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeProduct(body, { partial = false } = {}) {
  const product = {};
  const nombre = cleanText(body.nombre);
  const categoria = cleanText(body.categoria);
  const imagen = cleanText(body.imagen);
  const descripcion = cleanText(body.descripcion);
  const precioPor = cleanText(body.precioPor || body.precio_por);
  const precio = Number(body.precio);

  if (!partial || body.nombre !== undefined) {
    if (nombre.length < 2) {
      throw new Error('El producto necesita un nombre valido.');
    }
    product.nombre = nombre;
  }

  if (!partial || body.categoria !== undefined) {
    if (!categoria) {
      throw new Error('El producto necesita una categoria.');
    }
    product.categoria = categoria;
  }

  if (!partial || body.imagen !== undefined) {
    if (!imagen.startsWith('/imagenes/') && !imagen.startsWith('https://')) {
      throw new Error('La imagen debe ser una ruta de /imagenes/ o una URL https.');
    }
    product.imagen = imagen;
  }

  if (!partial || body.descripcion !== undefined) {
    if (descripcion.length < 10) {
      throw new Error('La descripcion debe tener al menos 10 caracteres.');
    }
    product.descripcion = descripcion;
  }

  if (!partial || body.precioPor !== undefined || body.precio_por !== undefined) {
    product.precio_por = precioPor || '100gr';
  }

  if (!partial || body.precio !== undefined) {
    if (!Number.isFinite(precio) || precio <= 0) {
      throw new Error('El precio debe ser mayor a cero.');
    }
    product.precio = precio;
  }

  if (body.activo !== undefined) {
    product.activo = Boolean(body.activo);
  } else if (!partial) {
    product.activo = true;
  }

  return product;
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
    .from('products')
    .select(PRODUCT_SELECT)
    .order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: (data || []).map(formatProduct) });
}

export async function POST(request) {
  const auth = await requireAdmin(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { supabase, response } = getSupabaseOrError();

  if (!supabase) {
    return response;
  }

  try {
    const product = normalizeProduct(await request.json());
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select(PRODUCT_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: formatProduct(data) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
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

  try {
    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'Falta el id del producto.' }, { status: 400 });
    }

    const product = normalizeProduct(body, { partial: true });
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: formatProduct(data) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
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

  const id = Number(new URL(request.url).searchParams.get('id'));

  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Falta el id del producto.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
