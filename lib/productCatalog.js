import fallbackProducts from '../public/productos.json';
import { getSupabaseAdmin } from './supabaseAdmin';

export function formatProduct(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: Number(row.precio),
    categoria: row.categoria,
    imagen: row.imagen,
    descripcion: row.descripcion,
    precioPor: row.precio_por || row.precioPor || '100gr',
    activo: row.activo !== false
  };
}

export async function getCatalogProducts({ includeInactive = false } = {}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      productos: fallbackProducts,
      source: 'fallback'
    };
  }

  let query = supabase
    .from('products')
    .select('id, nombre, precio, categoria, imagen, descripcion, precio_por, activo')
    .order('id', { ascending: true });

  if (!includeInactive) {
    query = query.eq('activo', true);
  }

  const { data, error } = await query;

  if (error || !data) {
    return {
      productos: fallbackProducts,
      source: 'fallback',
      error: error?.message
    };
  }

  return {
    productos: data.map(formatProduct),
    source: 'supabase'
  };
}
