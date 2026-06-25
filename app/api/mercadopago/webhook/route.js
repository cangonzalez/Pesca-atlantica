import { NextResponse } from 'next/server';
import { updateOrderPayment } from '../../../../lib/supabaseAdmin';

const MERCADO_PAGO_PAYMENTS_URL = 'https://api.mercadopago.com/v1/payments';

function getPaymentId(requestUrl, body) {
  const url = new URL(requestUrl);
  const resourceId = typeof body?.resource === 'string'
    ? body.resource.split('/').pop()
    : null;

  return (
    body?.data?.id ||
    body?.id ||
    resourceId ||
    url.searchParams.get('data.id') ||
    url.searchParams.get('id')
  );
}

function isPaymentNotification(requestUrl, body) {
  const url = new URL(requestUrl);
  const type = body?.type || url.searchParams.get('type');
  const topic = body?.topic || url.searchParams.get('topic');

  return type === 'payment' || topic === 'payment';
}

async function getMercadoPagoPayment(paymentId) {
  const accessToken = process.env.MERCADOPAGO_TEST_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    throw new Error('Falta configurar MERCADOPAGO_TEST_ACCESS_TOKEN.');
  }

  const response = await fetch(`${MERCADO_PAGO_PAYMENTS_URL}/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const payment = await response.json();

  if (!response.ok) {
    throw new Error(payment.message || 'No se pudo consultar el pago en Mercado Pago.');
  }

  return payment;
}

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    if (!isPaymentNotification(request.url, body)) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const paymentId = getPaymentId(request.url, body);

    if (!paymentId) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'missing_payment_id' });
    }

    const payment = await getMercadoPagoPayment(paymentId);
    const externalReference = payment.external_reference;

    if (!externalReference) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'missing_external_reference' });
    }

    const supabaseResult = await updateOrderPayment(externalReference, payment);

    return NextResponse.json({
      ok: true,
      externalReference,
      paymentId: String(payment.id),
      status: payment.status,
      supabase: supabaseResult
    });
  } catch (error) {
    console.error('Mercado Pago webhook failed:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'No se pudo procesar el webhook.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return POST(request);
}
