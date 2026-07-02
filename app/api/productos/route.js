import { NextResponse } from 'next/server';
import { getCatalogProducts } from '../../../lib/productCatalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { productos } = await getCatalogProducts();

  return NextResponse.json({
    productos
  });
}
