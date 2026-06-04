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
  const { cart, user, removeFromCart, clearCart, getTotal, registerUser, loginUser, logoutUser } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [authError, setAuthError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const cartItemCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  const cartButtonRef = useRef(null);
  const cartCloseButtonRef = useRef(null);
  const authCloseButtonRef = useRef(null);

  const closeCart = () => {
    setIsCartOpen(false);
    cartButtonRef.current?.focus();
  };

  const closeAuthModal = () => {
    setIsAuthOpen(false);
    cartButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isCartOpen && !isAuthOpen) {
      document.body.classList.remove('no-scroll');
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return;
      }

      if (isAuthOpen) {
        closeAuthModal();
        return;
      }

      closeCart();
    };

    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', handleKeyDown);

    if (isAuthOpen) {
      authCloseButtonRef.current?.focus();
    } else {
      cartCloseButtonRef.current?.focus();
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, isAuthOpen]);

  const openAuthModal = (mode = 'register') => {
    setAuthMode(mode);
    setAuthError('');
    setIsAuthOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setAuthError('');
  };

  const completePurchase = async (buyer) => {
    setPurchaseMessage('');
    setCheckoutError('');

    if (cart.length === 0) {
      return;
    }

    if (!buyer) {
      openAuthModal('register');
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

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    try {
      let sessionUser;

      if (authMode === 'register') {
        sessionUser = registerUser(formData);
      } else {
        sessionUser = loginUser(formData);
      }

      setIsAuthOpen(false);
      setFormData({ name: '', email: '', password: '' });
      await completePurchase(sessionUser);
    } catch (error) {
      setAuthError(error.message);
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
              <button type="button" onClick={logoutUser}>Cerrar sesión</button>
            </div>
          ) : (
            <p className="cart-auth-note">Para finalizar la compra tenés que registrarte o iniciar sesión.</p>
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

      {isAuthOpen && (
        <div
          className="modal-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAuthModal();
            }
          }}
        >
          <div className="auth-modal" role="document">
            <button
              ref={authCloseButtonRef}
              className="modal-close"
              type="button"
              onClick={closeAuthModal}
              aria-label="Cerrar registro"
            >
              &times;
            </button>

            <h2 id="auth-modal-title">
              {authMode === 'register' ? 'Registrate para comprar' : 'Iniciar sesión'}
            </h2>
            <p>Necesitamos tus datos para poder confirmar el pedido y coordinar la entrega.</p>

            <div className="auth-tabs" aria-label="Elegir registro o inicio de sesión">
              <button
                className={authMode === 'register' ? 'active' : ''}
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
              >
                Registrarme
              </button>
              <button
                className={authMode === 'login' ? 'active' : ''}
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
              >
                Ya tengo cuenta
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
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
              )}

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

              <label>
                Contraseña
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                />
              </label>

              {authError && <p className="auth-error" role="alert">{authError}</p>}

              <button className="checkout-btn" type="submit">
                {isCheckingOut
                  ? 'Preparando pago...'
                  : authMode === 'register'
                    ? 'Registrarme y pagar'
                    : 'Entrar y pagar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
