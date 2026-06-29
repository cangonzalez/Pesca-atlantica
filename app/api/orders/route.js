import { NextResponse } from 'next/server';
import { getUserFromAccessToken, listOrdersForUser } from '../../../lib/supabaseAdmin';

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorization.slice(7).trim();
}

export async function GET(request) {
  const user = await getUserFromAccessToken(getBearerToken(request));

  if (!user) {
    return NextResponse.json(
      { error: 'Iniciá sesión para ver tu historial de compras.' },
      { status: 401 }
    );
  }

  const result = await listOrdersForUser(user.id);

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.json({ orders: result.orders });
}
