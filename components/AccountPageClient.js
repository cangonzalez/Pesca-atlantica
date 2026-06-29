'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}

function formatOrderDate(date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

function getOrderItemsLabel(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Pedido sin detalle';
  }

  return items.map((item) => `${item.title} x ${item.quantity}`).join(', ');
}

export default function AccountPageClient() {
  const { user, isAuthenticated, isAuthReady, getAccessToken, signOut } = useCart();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    const loadOrders = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || 'No se pudo cargar tu historial.');
        }

        setOrders(data.orders || []);
      } catch (loadError) {
        setError(loadError.message || 'No se pudo cargar tu historial.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [getAccessToken, isAuthenticated]);

  if (!isAuthReady) {
    return (
      <section className="account-page">
        <p>Cargando cuenta...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="account-page">
        <div className="account-page-header">
          <p className="payment-eyebrow">Mi cuenta</p>
          <h1>No iniciaste sesión</h1>
          <p>
            Podés comprar como invitado desde el carrito, o iniciar sesión desde la cabecera para guardar historial.
          </p>
        </div>
        <Link className="btn" href="/productos">Ir a productos</Link>
      </section>
    );
  }

  return (
    <section className="account-page">
      <div className="account-page-header">
        <p className="payment-eyebrow">Mi cuenta</p>
        <h1>Hola, {user?.name || user?.email}</h1>
        <p>{user?.email}</p>
        <button className="clear-cart-btn account-logout" type="button" onClick={signOut}>
          Cerrar sesión
        </button>
      </div>

      <div className="account-history">
        <h2>Historial de compras</h2>
        {isLoading && <p>Cargando historial...</p>}
        {error && <p className="cart-error" role="alert">{error}</p>}
        {!isLoading && !error && orders.length === 0 && (
          <p>Todavía no hay compras asociadas a esta cuenta.</p>
        )}
        {!isLoading && orders.length > 0 && (
          <div className="account-order-list">
            {orders.map((order) => (
              <article className="account-order" key={order.id}>
                <div>
                  <strong>{formatPrice(Number(order.total_amount || 0))}</strong>
                  <span>{formatOrderDate(order.created_at)}</span>
                </div>
                <p>{getOrderItemsLabel(order.items)}</p>
                {order.delivery_address && <small>Entrega: {order.delivery_address}</small>}
                <small>Estado: {order.status}</small>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
