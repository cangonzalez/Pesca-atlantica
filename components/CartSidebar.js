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

const SHIPPING_COST = 0;

export default function CartSidebar() {
  const {
    cart,
    user,
    isAuthenticated,
    isAuthReady,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    saveBuyer,
    signIn,
    signUp,
    signOut,
    getAccessToken
  } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [buyerError, setBuyerError] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    deliveryNotes: ''
  });
  const [authFormData, setAuthFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const cartItemCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  const subtotal = getTotal();
  const total = subtotal + SHIPPING_COST;
  const hasCartItems = cart.length > 0;
  const shouldShowCheckoutChoice = hasCartItems && isAuthReady && !isAuthenticated && !user;
  const canStartCheckout = hasCartItems && Boolean(user);
  const cartButtonRef = useRef(null);
  const cartCloseButtonRef = useRef(null);
  const buyerCloseButtonRef = useRef(null);
  const authCloseButtonRef = useRef(null);

  const closeCart = () => {
    setIsCartOpen(false);
    cartButtonRef.current?.focus();
  };

  const closeBuyerModal = () => {
    setIsBuyerModalOpen(false);
    cartButtonRef.current?.focus();
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError('');
    setAuthNotice('');
    cartButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!isCartOpen && !isBuyerModalOpen && !isAuthModalOpen) {
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

      if (isAuthModalOpen) {
        closeAuthModal();
        return;
      }

      closeCart();
    };

    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', handleKeyDown);

    if (isAuthModalOpen) {
      authCloseButtonRef.current?.focus();
    } else if (isBuyerModalOpen) {
      buyerCloseButtonRef.current?.focus();
    } else {
      cartCloseButtonRef.current?.focus();
    }

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, isBuyerModalOpen, isAuthModalOpen]);

  const openBuyerModal = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      deliveryNotes: user?.deliveryNotes || ''
    });
    setBuyerError('');
    setIsBuyerModalOpen(true);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthNotice('');
    setIsBuyerModalOpen(false);
    setAuthFormData({
      name: user?.isAuthenticated ? user.name || '' : '',
      email: user?.email || '',
      password: ''
    });
    setIsAuthModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setBuyerError('');
  };

  const handleAuthInputChange = (event) => {
    const { name, value } = event.target;
    setAuthFormData((currentData) => ({ ...currentData, [name]: value }));
    setAuthError('');
    setAuthNotice('');
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
      const accessToken = getAccessToken();
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
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
    if (cart.length === 0) {
      return;
    }

    if (!user) {
      setCheckoutError('Elegí si querés continuar como invitado o iniciar sesión.');
      return;
    }

    if (isAuthenticated) {
      openBuyerModal();
      return;
    }

    completePurchase(user);
  };

  const handleBuyerSubmit = async (event) => {
    event.preventDefault();

    try {
      const sessionUser = saveBuyer(formData);
      setIsBuyerModalOpen(false);
      await completePurchase(sessionUser);
    } catch (error) {
      setBuyerError(error.message);
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsAuthSubmitting(true);
    setAuthError('');
    setAuthNotice('');

    try {
      if (authMode === 'login') {
        await signIn(authFormData);
        setPurchaseMessage('Sesión iniciada. Tus compras nuevas van a quedar en tu historial.');
        closeAuthModal();
      } else {
        const data = await signUp(authFormData);

        if (data.session) {
          setPurchaseMessage('Cuenta creada. Tus compras nuevas van a quedar en tu historial.');
          closeAuthModal();
        } else {
          setAuthNotice('Cuenta creada. Si Supabase pide confirmación, revisá tu email antes de iniciar sesión.');
        }
      }
    } catch (error) {
      setAuthError(error.message || 'No se pudo procesar la cuenta.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setOrders([]);
    setIsHistoryOpen(false);
    setPurchaseMessage('Sesión cerrada. Podés seguir comprando como invitado.');
  };

  const loadOrderHistory = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isHistoryOpen) {
      setIsHistoryOpen(false);
      return;
    }

    setIsHistoryOpen(true);
    setHistoryError('');
    setIsHistoryLoading(true);

    try {
      const accessToken = getAccessToken();
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo cargar el historial.');
      }

      setOrders(data.orders || []);
    } catch (error) {
      setHistoryError(error.message || 'No se pudo cargar el historial.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const formatOrderDate = (date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getOrderItemsLabel = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return 'Pedido sin detalle';
    }

    return items
      .map((item) => `${item.title} x ${item.quantity}`)
      .join(', ');
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
        <svg className="cart-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 001.95 1.61H19a2 2 0 001.95-1.55L23 6H6"/>
        </svg>
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

        <div className="cart-body">
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <strong>Carrito vacío</strong>
              <span>Agregá productos para preparar tu pedido.</span>
            </div>
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
                  <p>{item.peso}</p>
                  <div className="cart-item-qty">
                    <button
                      className="cart-item-qty-btn"
                      type="button"
                      onClick={() => updateQuantity(index, -1)}
                      aria-label="Quitar uno"
                    >
                      −
                    </button>
                    <span className="cart-item-qty-count">{item.cantidad || 1}</span>
                    <button
                      className="cart-item-qty-btn"
                      type="button"
                      onClick={() => updateQuantity(index, 1)}
                      aria-label="Agregar uno"
                    >
                      +
                    </button>
                  </div>
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
          {hasCartItems && isAuthenticated && (
            <div className="cart-account-panel">
              <div>
                <span className="cart-account-label">Sesión activa</span>
                <strong>{user?.name || user?.email}</strong>
                <small>{user?.email}</small>
              </div>
              <div className="cart-account-actions">
                <button type="button" onClick={loadOrderHistory}>
                  {isHistoryOpen ? 'Ocultar historial' : 'Ver historial'}
                </button>
                <button type="button" onClick={handleSignOut}>Cerrar sesión</button>
              </div>
            </div>
          )}

          {isHistoryOpen && (
            <div className="order-history">
              <h3>Historial de compras</h3>
              {isHistoryLoading && <p>Cargando historial...</p>}
              {historyError && <p className="cart-error" role="alert">{historyError}</p>}
              {!isHistoryLoading && !historyError && orders.length === 0 && (
                <p>Todavía no hay compras asociadas a esta cuenta.</p>
              )}
              {!isHistoryLoading && orders.length > 0 && (
                <ul>
                  {orders.map((order) => (
                    <li key={order.id}>
                      <div>
                        <strong>{formatPrice(Number(order.total_amount || 0))}</strong>
                        <span>{formatOrderDate(order.created_at)}</span>
                      </div>
                      <p>{getOrderItemsLabel(order.items)}</p>
                      {order.delivery_address && <small>Entrega: {order.delivery_address}</small>}
                      <small>Estado: {order.status}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {hasCartItems && (
            <>
              {user ? (
                <div className="cart-user">
                  <span>
                    {user.isAuthenticated
                      ? `Comprás con tu cuenta: ${user.name || user.email}`
                      : `Comprás como invitado: ${user.name || user.email}`}
                  </span>
                  {!user.isAuthenticated && (
                    <button type="button" onClick={openBuyerModal}>Cambiar datos</button>
                  )}
                </div>
              ) : !isAuthReady ? (
                <p className="cart-auth-note">Estamos revisando si ya tenés una sesión activa.</p>
              ) : (
                null
              )}

              {purchaseMessage && <p className="cart-success">{purchaseMessage}</p>}
              {checkoutError && <p className="cart-error" role="alert">{checkoutError}</p>}
            </>
          )}

          <div className="cart-summary" aria-label="Resumen de compra">
            <h3>Resumen</h3>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="cart-summary-row">
              <span>Envío</span>
              <strong className="free-shipping">Gratis</strong>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          {shouldShowCheckoutChoice ? (
            <div className="cart-checkout-choice">
              <p>
                Para finalizar la compra, elegí cómo querés seguir. Como invitado igual te pedimos
                datos de contacto y entrega.
              </p>
              <div className="cart-checkout-choice-actions">
                <button className="checkout-btn" type="button" onClick={openBuyerModal}>
                  Continuar como invitado
                </button>
                <button className="clear-cart-btn" type="button" onClick={() => openAuthModal('login')}>
                  Iniciar sesión
                </button>
              </div>
            </div>
          ) : (
            <button
              className="checkout-btn"
              type="button"
              onClick={handleCheckout}
              disabled={!canStartCheckout || isCheckingOut}
            >
              {isCheckingOut ? 'Preparando pago...' : 'Finalizar compra'}
            </button>
          )}
          <button
            className="clear-cart-btn"
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0 || isCheckingOut}
          >
            Vaciar carrito
          </button>
        </div>
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

            <h2 id="buyer-modal-title">
              {isAuthenticated ? 'Confirmar datos de entrega' : 'Comprar como invitado'}
            </h2>
            <p>
              Estos datos no reemplazan el pago: los usamos para preparar el pedido y coordinar la entrega.
            </p>

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
                  readOnly={isAuthenticated}
                />
              </label>

              <label>
                Teléfono
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  autoComplete="tel"
                />
              </label>

              <label>
                Dirección de entrega
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  autoComplete="street-address"
                />
              </label>

              <label>
                Notas para la entrega
                <textarea
                  name="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Piso, horario preferido o aclaraciones"
                />
              </label>

              {buyerError && <p className="auth-error" role="alert">{buyerError}</p>}

              <button className="checkout-btn" type="submit" disabled={isCheckingOut}>
                {isCheckingOut ? 'Preparando pago...' : 'Continuar al pago'}
              </button>
              {!isAuthenticated && (
                <button className="clear-cart-btn" type="button" onClick={() => openAuthModal('login')}>
                  Iniciar sesión y guardar historial
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
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
              aria-label="Cerrar cuenta"
            >
              &times;
            </button>

            <h2 id="auth-modal-title">
              {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p>
              Con una cuenta podés mantener la sesión activa y ver el historial de compras.
            </p>

            <div className="auth-tabs" role="tablist" aria-label="Cuenta">
              <button
                className={authMode === 'login' ? 'active' : ''}
                type="button"
                onClick={() => setAuthMode('login')}
              >
                Entrar
              </button>
              <button
                className={authMode === 'register' ? 'active' : ''}
                type="button"
                onClick={() => setAuthMode('register')}
              >
                Crear cuenta
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  Nombre
                  <input
                    type="text"
                    name="name"
                    value={authFormData.name}
                    onChange={handleAuthInputChange}
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
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  required
                  minLength={6}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>

              {authNotice && <p className="auth-notice">{authNotice}</p>}
              {authError && <p className="auth-error" role="alert">{authError}</p>}

              <button className="checkout-btn" type="submit" disabled={isAuthSubmitting}>
                {isAuthSubmitting
                  ? 'Procesando...'
                  : authMode === 'login'
                    ? 'Entrar'
                    : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
