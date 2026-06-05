'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}

export default function CartSidebar() {
  const { cart, user, removeFromCart, clearCart, getTotal, saveBuyer } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [buyerError, setBuyerError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const cartItemCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  const cartButtonRef = useRef(null);
  const cartCloseButtonRef = useRef(null);
  const buyerCloseButtonRef = useRef(null);

  const closeCart = () => {
    setIsCartOpen(false);
    cartButtonRef.current?.focus();
  };

  const closeBuyerModal = () => {
    setIsBuyerModalOpen(false);
    cartButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isCartOpen && !isBuyerModalOpen) {
      document.body.classList.remove('no-scroll');
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (isBuyerModalOpen) {
        closeBuyerModal();
        return;
      }

      closeCart();
    };

    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', handleKeyDown);

    if (isBuyerModalOpen) {
      buyerCloseButtonRef.current?.focus();
    } else {
      cartCloseButtonRef.current?.focus();
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, isBuyerModalOpen]);

  const openBuyerModal = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setBuyerError('');
    setIsBuyerModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setBuyerError('');
  };

  const completePurchase = async (buyer) => {
    setPurchaseMessage('');
    setCheckoutError('');

    if (cart.length === 0) {
      return;
    }

    if (!buyer) {
      openBuyerModal();
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cart, buyer })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear el pago de prueba.');
      }

      setPurchaseMessage('Te estamos llevando al checkout de prueba de Mercado Pago.');
      window.location.href = data.initPoint;
    } catch (error) {
      setCheckoutError(error.message || 'No se pudo conectar con Mercado Pago.');
      setIsCheckingOut(false);
    }
  };

  const handleCheckout = () => {
    completePurchase(user);
  };

  const handleBuyerSubmit = async (event) => {
    event.preventDefault();

    try {
      const sessionUser = saveBuyer(formData);
      setIsBuyerModalOpen(false);
      setFormData({ name: '', email: '' });
      await completePurchase(sessionUser);
    } catch (error) {
      setBuyerError(error.message);
    }
  };

  return (
    <>
      <button
        ref={cartButtonRef}
        className="cart-icon"
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Abrir carrito"
        aria-expanded={isCartOpen}
        aria-controls="cart-sidebar"
      >
        <span>Carrito</span>
        {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
      </button>

      <div
        className={`cart-backdrop ${isCartOpen ? 'active' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />

      <aside
        id="cart-sidebar"
        className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}
        aria-label="Carrito de compras"
        aria-hidden={!isCartOpen}
      >
        <div className="cart-header">
          <h2>Carrito</h2>
          <button
            ref={cartCloseButtonRef}
            className="cart-item-remove"
            type="button"
            onClick={closeCart}
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
                <Image
                  src={item.imagen}
                  alt={item.nombre}
                  className="cart-item-image"
                  width={160}
                  height={160}
                  sizes="80px"
                />
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
          {user ? (
            <div className="cart-user">
              <span>Comprás como {user.name || user.email}</span>
              <button type="button" onClick={openBuyerModal}>Cambiar datos</button>
            </div>
          ) : (
            <p className="cart-auth-note">Para finalizar la compra necesitamos tu nombre y email.</p>
          )}

          {purchaseMessage && <p className="cart-success">{purchaseMessage}</p>}
          {checkoutError && <p className="cart-error" role="alert">{checkoutError}</p>}
          <p className="cart-test-note">Modo prueba: el pago se hace con dinero ficticio.</p>

          <div className="cart-total">
            <span>Total</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <button
            className="checkout-btn"
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut}
          >
            {isCheckingOut ? 'Preparando pago...' : 'Pagar con Mercado Pago'}
          </button>
          <button
            className="clear-cart-btn"
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0 || isCheckingOut}
          >
            Vaciar carrito
          </button>
        </div>
      </aside>

      {isBuyerModalOpen && (
        <div
          className="modal-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buyer-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeBuyerModal();
            }
          }}
        >
          <div className="auth-modal" role="document">
            <button
              ref={buyerCloseButtonRef}
              className="modal-close"
              type="button"
              onClick={closeBuyerModal}
              aria-label="Cerrar datos de compra"
            >
              &times;
            </button>

            <h2 id="buyer-modal-title">Datos para el pedido</h2>
            <p>Usamos estos datos para enviar el pago a Mercado Pago y coordinar la entrega.</p>

            <form className="auth-form" onSubmit={handleBuyerSubmit}>
              <label>
                Nombre
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                />
              </label>

              {buyerError && <p className="auth-error" role="alert">{buyerError}</p>}

              <button className="checkout-btn" type="submit">
                {isCheckingOut ? 'Preparando pago...' : 'Continuar al pago'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
