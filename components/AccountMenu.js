'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';

function getFirstName(nameOrEmail) {
  if (!nameOrEmail) {
    return '';
  }

  return nameOrEmail.split('@')[0].split(' ')[0];
}

export default function AccountMenu() {
  const { user, isAuthenticated, isAuthReady, signIn, signUp, signOut } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const menuRef = useRef(null);
  const closeButtonRef = useRef(null);

  const displayName = getFirstName(user?.name || user?.email);
  const accountLabel = !isAuthReady
    ? 'Cuenta'
    : isAuthenticated
      ? `Hola, ${displayName || 'cliente'}`
      : user
        ? 'Invitado'
        : 'Iniciar sesión';

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthError('');
    setAuthNotice('');
    setFormData({
      name: user?.isAuthenticated ? user.name || '' : '',
      email: user?.email || '',
      password: ''
    });
    setIsMenuOpen(false);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError('');
    setAuthNotice('');
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAuthModal();
      }
    };

    document.body.classList.add('no-scroll');
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthModalOpen]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setAuthError('');
    setAuthNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError('');
    setAuthNotice('');

    try {
      if (authMode === 'login') {
        await signIn(formData);
        closeAuthModal();
      } else {
        const data = await signUp(formData);

        if (data.session) {
          closeAuthModal();
        } else {
          setAuthNotice('Cuenta creada. Si Supabase pide confirmación, revisá tu email antes de iniciar sesión.');
        }
      }
    } catch (error) {
      setAuthError(error.message || 'No se pudo procesar la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <div className="account-menu" ref={menuRef}>
      <button
        className={`account-trigger ${isAuthenticated ? 'authenticated' : ''}`}
        type="button"
        onClick={() => setIsMenuOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
      >
        <span className="account-avatar" aria-hidden="true">
          {isAuthenticated ? (
            (displayName || 'C').charAt(0).toUpperCase()
          ) : (
            <svg
              className="account-person-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </span>
        <span className="account-trigger-text">{accountLabel}</span>
      </button>

      {isMenuOpen && (
        <div className="account-dropdown" role="menu">
          {isAuthenticated ? (
            <>
              <p className="account-dropdown-title">Sesión activa</p>
              <strong>{user?.name || user?.email}</strong>
              <small>{user?.email}</small>
              <Link href="/cuenta" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Mi cuenta e historial
              </Link>
              <Link href="/admin" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                Panel admin
              </Link>
              <button type="button" onClick={handleSignOut} role="menuitem">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <p className="account-dropdown-title">
                {user ? 'Estás comprando como invitado' : 'Todavía no iniciaste sesión'}
              </p>
              {user?.email && <small>{user.email}</small>}
              <button type="button" onClick={() => openAuthModal('login')} role="menuitem">
                Iniciar sesión
              </button>
              <button type="button" onClick={() => openAuthModal('register')} role="menuitem">
                Crear cuenta
              </button>
            </>
          )}
        </div>
      )}

      {isAuthModalOpen && (
        <div
          className="modal-overlay active"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-auth-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAuthModal();
            }
          }}
        >
          <div className="auth-modal" role="document">
            <button
              ref={closeButtonRef}
              className="modal-close"
              type="button"
              onClick={closeAuthModal}
              aria-label="Cerrar cuenta"
            >
              &times;
            </button>

            <h2 id="account-auth-title">
              {authMode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p>Tu sesión queda activa para comprar más rápido y consultar tu historial.</p>

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

            <form className="auth-form" onSubmit={handleSubmit}>
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
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
              </label>

              {authNotice && <p className="auth-notice">{authNotice}</p>}
              {authError && <p className="auth-error" role="alert">{authError}</p>}

              <button className="checkout-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Procesando...'
                  : authMode === 'login'
                    ? 'Entrar'
                    : 'Crear cuenta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
