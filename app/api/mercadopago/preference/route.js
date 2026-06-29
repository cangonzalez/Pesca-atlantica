import { NextResponse } from 'next/server';
import productos from '../../../../public/productos.json';
import { getUserFromAccessToken, saveOrder } from '../../../../lib/supabaseAdmin';

const MERCADO_PAGO_PREFERENCES_URL = 'https://api.mercadopago.com/checkout/preferences';
const AVAILABLE_GRAMS = new Set([100, 200, 250, 300, 350, 500, 600, 700, 800, 1000]);
const SHIPPING_COST = 0;

const productsById = new Map(productos.map((producto) => [producto.id, producto]));

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isTestUserEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith('@testuser.com');
}

function getBearerToken(request) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorization.slice(7).trim();
}

function getAuthenticatedName(user, buyer) {
  return (
    cleanText(buyer?.name) ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    ''
  );
}

function getCheckoutDetails(buyer, authenticatedUser) {
  const buyerPhone = cleanText(buyer?.phone);
  const deliveryAddress = cleanText(buyer?.address);
  const deliveryNotes = cleanText(buyer?.deliveryNotes);

  if (!buyerPhone) {
    throw new Error('Necesitamos un teléfono para coordinar la entrega.');
  }

  if (!deliveryAddress) {
    throw new Error('Necesitamos una dirección de entrega.');
  }

  if (authenticatedUser) {
    return {
      buyer_user_id: authenticatedUser.id,
      buyer_name: getAuthenticatedName(authenticatedUser, buyer),
      buyer_email: authenticatedUser.email,
      buyer_phone: buyerPhone,
      delivery_address: deliveryAddress,
      delivery_notes: deliveryNotes
    };
  }

  const buyerName = cleanText(buyer?.name);
  const buyerEmail = cleanText(buyer?.email).toLowerCase();

  if (!buyerName) {
    throw new Error('Necesitamos tu nombre para preparar el pedido.');
  }

  if (!isValidEmail(buyerEmail)) {
    throw new Error('Necesitamos un email válido para preparar el pedido.');
  }

  return {
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    buyer_phone: buyerPhone,
    delivery_address: deliveryAddress,
    delivery_notes: deliveryNotes
  };
}

function getQuantity(value) {
  const quantity = Number(value || 1);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error('Hay un producto con una cantidad invalida.');
  }

  return quantity;
}

function getGrams(value) {
  const grams = Number(value);

  if (!Number.isInteger(grams) || !AVAILABLE_GRAMS.has(grams)) {
    throw new Error('Hay un producto con un peso invalido.');
  }

  return grams;
}

function cleanBaseUrl(value) {
  if (!value) {
    return '';
  }

  return value.trim().replace(/\/$/, '');
}

function getPublicBaseUrl(request) {
  const configuredUrl = cleanBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  const requestOrigin = cleanBaseUrl(request.headers.get('origin'));

  if (configuredUrl) {
    return configuredUrl;
  }

  if (requestOrigin?.startsWith('https://')) {
    return requestOrigin;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return '';
}

function buildBackUrls(baseUrl) {
  if (!baseUrl) {
    return null;
  }

  try {
    const url = new URL(baseUrl);

    if (url.protocol !== 'https:') {
      return null;
    }

    return {
      success: `${url.origin}/pago`,
      failure: `${url.origin}/pago`,
      pending: `${url.origin}/pago`
    };
  } catch {
    return null;
  }
}

function getPictureUrl(path, baseUrl) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (baseUrl && path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }

  return '';
}

function buildPreferenceItems(cart, baseUrl) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('El carrito esta vacio.');
  }

  return cart.map((item) => {
    const product = productsById.get(Number(item.id));

    if (!product) {
      throw new Error('Hay un producto que ya no esta disponible.');
    }

    const quantity = getQuantity(item.cantidad);
    const grams = getGrams(item.gramos);
    const unitPrice = Math.round(product.precio * (grams / 100));

    if (unitPrice <= 0) {
      throw new Error('Hay un producto con precio invalido.');
    }

    const pictureUrl = getPictureUrl(product.imagen, baseUrl);

    return {
      id: String(product.id),
      title: `${product.nombre} (${grams}g)`,
      description: product.descripcion,
      category_id: 'food',
      quantity,
      currency_id: 'ARS',
      unit_price: unitPrice,
      ...(pictureUrl ? { picture_url: pictureUrl } : {})
    };
  });
}

function getTotalAmount(items) {
  return items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
}

export async function POST(request) {
  const accessToken = process.env.MERCADOPAGO_TEST_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          'Falta configurar MERCADOPAGO_TEST_ACCESS_TOKEN con el Access Token de Pruebas de Mercado Pago.'
      },
      { status: 500 }
    );
  }

  if (!accessToken.startsWith('TEST-') && !accessToken.startsWith('APP_USR-')) {
    return NextResponse.json(
      {
        error:
          'MERCADOPAGO_TEST_ACCESS_TOKEN debe contener el Access Token copiado desde Credenciales de prueba de Mercado Pago.'
      },
      { status: 500 }
    );
  }

  try {
    const { cart, buyer } = await request.json();
    const authenticatedUser = await getUserFromAccessToken(getBearerToken(request));
    const publicBaseUrl = getPublicBaseUrl(request);
    const items = buildPreferenceItems(cart, publicBaseUrl);
    const backUrls = buildBackUrls(publicBaseUrl);
    const externalReference = `pescatlantica-${Date.now()}`;
    const buyerMetadata = getCheckoutDetails(buyer, authenticatedUser);

    const body = {
      items,
      external_reference: externalReference,
      statement_descriptor: 'PESCATLANTICA',
      metadata: {
        source: 'pescatlantica-web',
        environment: 'test',
        shipping_cost: SHIPPING_COST,
        ...buyerMetadata
      }
    };

    if (isTestUserEmail(buyerMetadata.buyer_email)) {
      body.payer = {
        email: buyerMetadata.buyer_email,
        name: buyerMetadata.buyer_name || undefined
      };
    }

    if (backUrls) {
      body.back_urls = backUrls;
      body.auto_return = 'approved';
    }

    if (process.env.MERCADOPAGO_WEBHOOK_URL) {
      body.notification_url = process.env.MERCADOPAGO_WEBHOOK_URL;
    }

    const mercadoPagoResponse = await fetch(MERCADO_PAGO_PREFERENCES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const preference = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      return NextResponse.json(
        { error: preference.message || 'Mercado Pago no pudo crear la preferencia de pago.' },
        { status: mercadoPagoResponse.status }
      );
    }

    const initPoint = preference.sandbox_init_point;

    if (!initPoint) {
      return NextResponse.json(
        { error: 'Mercado Pago no devolvio una URL de sandbox para esta preferencia de prueba.' },
        { status: 502 }
      );
    }

    const supabaseResult = await saveOrder({
      external_reference: externalReference,
      mercadopago_preference_id: preference.id,
      status: 'preference_created',
      buyer_user_id: buyerMetadata.buyer_user_id || null,
      buyer_name: buyerMetadata.buyer_name || null,
      buyer_email: buyerMetadata.buyer_email || null,
      buyer_phone: buyerMetadata.buyer_phone || null,
      delivery_address: buyerMetadata.delivery_address || null,
      delivery_notes: buyerMetadata.delivery_notes || null,
      currency: 'ARS',
      shipping_cost: SHIPPING_COST,
      total_amount: getTotalAmount(items),
      items
    });

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint,
      externalReference,
      supabase: supabaseResult
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'No se pudo preparar el pago.' },
      { status: 400 }
    );
  }
}
