import { NextResponse } from 'next/server';
import productos from '../../../public/productos.json';

export async function GET() {
  return NextResponse.json({
    productos
  });
}
