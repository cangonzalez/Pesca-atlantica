import Link from 'next/link';

const STATUS_MESSAGES = {
  approved: {
    title: 'Pago aprobado',
    message: 'Mercado Pago marco el pago como aprobado. Ya podriamos usar este resultado para confirmar el pedido.'
  },
  pending: {
    title: 'Pago pendiente',
    message: 'Mercado Pago dejo el pago pendiente. Este estado puede aparecer con medios de pago que no acreditan al instante.'
  },
  in_process: {
    title: 'Pago en proceso',
    message: 'Mercado Pago esta procesando la operacion. Conviene esperar la confirmacion antes de preparar el pedido.'
  },
  rejected: {
    title: 'Pago rechazado',
    message: 'Mercado Pago rechazo el pago de prueba. Podes volver al carrito e intentar con otro escenario de test.'
  },
  failure: {
    title: 'Pago rechazado',
    message: 'Mercado Pago rechazo el pago de prueba. Podes volver al carrito e intentar con otro escenario de test.'
  }
};

export default function PagoPage({ searchParams }) {
  const status = searchParams?.status || searchParams?.collection_status || searchParams?.estado;
  const paymentId = searchParams?.payment_id || searchParams?.collection_id;
  const preferenceId = searchParams?.preference_id;
  const content = STATUS_MESSAGES[status] || {
    title: 'Resultado del pago',
    message: 'Cuando Mercado Pago redirija a esta pagina, aca vas a ver el estado de la operacion de prueba.'
  };

  return (
    <main>
      <section className="page-intro payment-result">
        <p className="payment-eyebrow">Checkout Pro test</p>
        <h1>{content.title}</h1>
        <p>{content.message}</p>

        {(status || paymentId || preferenceId) && (
          <dl className="payment-details">
            {status && (
              <>
                <dt>Estado</dt>
                <dd>{status}</dd>
              </>
            )}
            {paymentId && (
              <>
                <dt>ID de pago</dt>
                <dd>{paymentId}</dd>
              </>
            )}
            {preferenceId && (
              <>
                <dt>Preferencia</dt>
                <dd>{preferenceId}</dd>
              </>
            )}
          </dl>
        )}

        <div className="payment-actions">
          <Link className="btn" href="/productos">Volver a productos</Link>
          <Link className="clear-cart-btn payment-link" href="/contacto">Contactar</Link>
        </div>
      </section>
    </main>
  );
}
