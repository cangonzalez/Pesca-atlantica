import Link from 'next/link';
import CartClearer from '../../components/CartClearer';

const STATUS_MESSAGES = {
  approved: {
    title: '¡Pedido confirmado!',
    message: 'Tu pago fue aprobado. En breve nos ponemos en contacto para coordinar la entrega.'
  },
  pending: {
    title: 'Pago pendiente',
    message: 'Estamos esperando la confirmación del pago. Te avisamos cuando esté acreditado.'
  },
  in_process: {
    title: 'Pago en proceso',
    message: 'Tu pago está siendo procesado. Te notificamos en cuanto se confirme.'
  },
  rejected: {
    title: 'Pago rechazado',
    message: 'El pago no pudo completarse. Podés intentar de nuevo con otro medio de pago.'
  },
  failure: {
    title: 'Pago rechazado',
    message: 'El pago no pudo completarse. Podés intentar de nuevo con otro medio de pago.'
  }
};

export default function PagoPage({ searchParams }) {
  const status = searchParams?.status || searchParams?.collection_status || searchParams?.estado;
  const paymentId = searchParams?.payment_id || searchParams?.collection_id;
  const isRejected = status === 'rejected' || status === 'failure';
  const content = STATUS_MESSAGES[status] || {
    title: 'Estado del pedido',
    message: 'Si completaste el pago, vas a recibir una confirmación por email en breve.'
  };

  return (
    <main>
      <CartClearer status={status} />
      <section className="page-intro payment-result">
        <h1>{content.title}</h1>
        <p>{content.message}</p>

        {paymentId && (
          <p className="payment-id-ref">N.° de pago: {paymentId}</p>
        )}

        <div className="payment-actions">
          {isRejected ? (
            <Link className="btn" href="/productos">Volver a productos</Link>
          ) : (
            <Link className="btn" href="/">Ir al inicio</Link>
          )}
          <Link className="clear-cart-btn payment-link" href="/contacto">Contactarnos</Link>
        </div>
      </section>
    </main>
  );
}
