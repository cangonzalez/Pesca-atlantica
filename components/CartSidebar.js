'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}

export default function CartSidebar() {
  const { cart, removeFromCart, clearCart, getTotal } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  return (
    <>
      <button
        className="cart-icon"
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Abrir carrito"
      >
        <span>Carrito</span>
        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
      </button>

      <aside className={`cart-sidebar ${isCartOpen ? 'active' : ''}`} aria-label="Carrito de compras">
        <div className="cart-header">
          <h2>Carrito</h2>
          <button
            className="cart-item-remove"
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            &times;
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Todavía no agregaste productos.</p>
          ) : (
            cart.map((item, index) => (
              <div className="cart-item" key={`${item.id}-${item.peso}`}>
                <img src={item.imagen} alt={item.nombre} className="cart-item-image" />
                <div className="cart-item-info">
                  <h4>{item.nombre}</h4>
                  <p>
                    {item.cantidad > 1
                      ? `${item.gramosTotales}g total (${item.peso} x ${item.cantidad})`
                      : item.peso}
                  </p>
                  <p>{formatPrice(item.precioTotal)}</p>
                </div>
                <button
                  className="cart-item-remove"
                  type="button"
                  onClick={() => removeFromCart(index)}
                  aria-label={`Quitar ${item.nombre}`}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <button
            className="checkout-btn"
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0}
          >
            Vaciar carrito
          </button>
        </div>
      </aside>
    </>
  );
}
