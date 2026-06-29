'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabaseClient';

const CartContext = createContext();

function normalizeBuyer({ name, email, phone, address, deliveryNotes }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedName = (name || '').trim();
  const normalizedPhone = (phone || '').trim();
  const normalizedAddress = (address || '').trim();
  const normalizedDeliveryNotes = (deliveryNotes || '').trim();

  if (!normalizedName) {
    throw new Error('Ingresá tu nombre para continuar.');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Ingresá un email válido.');
  }

  if (!normalizedPhone) {
    throw new Error('Ingresá un teléfono para coordinar la entrega.');
  }

  if (!normalizedAddress) {
    throw new Error('Ingresá una dirección de entrega.');
  }

  return {
    name: normalizedName,
    email: normalizedEmail,
    phone: normalizedPhone,
    address: normalizedAddress,
    deliveryNotes: normalizedDeliveryNotes
  };
}

function getNameFromSessionUser(sessionUser) {
  const metadataName = sessionUser?.user_metadata?.name || sessionUser?.user_metadata?.full_name;

  if (metadataName) {
    return metadataName;
  }

  return sessionUser?.email?.split('@')[0] || '';
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [guestBuyer, setGuestBuyer] = useState(null);
  const [authSession, setAuthSession] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const savedGuestBuyer = localStorage.getItem('guestBuyer') || localStorage.getItem('user');

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      if (savedGuestBuyer) {
        setGuestBuyer(JSON.parse(savedGuestBuyer));
      }
    } catch {
      localStorage.removeItem('cart');
      localStorage.removeItem('guestBuyer');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsAuthReady(true);
      return undefined;
    }

    let isActive = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isActive) {
        return;
      }

      setAuthSession(data.session || null);
      setAuthUser(data.session?.user || null);
      setIsAuthReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session || null);
      setAuthUser(session?.user || null);
      setIsAuthReady(true);
    });

    return () => {
      isActive = false;
      subscription?.subscription?.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (guestBuyer) {
      localStorage.setItem('guestBuyer', JSON.stringify(guestBuyer));
      localStorage.removeItem('user');
    } else {
      localStorage.removeItem('guestBuyer');
      localStorage.removeItem('user');
    }
  }, [guestBuyer, isLoaded]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.precioTotal, 0);
  }, [cart]);

  const user = useMemo(() => {
    if (authUser) {
      return {
        id: authUser.id,
        name: guestBuyer?.name || getNameFromSessionUser(authUser),
        email: authUser.email,
        phone: guestBuyer?.phone || '',
        address: guestBuyer?.address || '',
        deliveryNotes: guestBuyer?.deliveryNotes || '',
        isAuthenticated: true
      };
    }

    if (guestBuyer) {
      return {
        ...guestBuyer,
        isAuthenticated: false
      };
    }

    return null;
  }, [authUser, guestBuyer]);

  const addToCart = useCallback((item) => {
    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        i => i.id === item.id && i.peso === item.peso
      );

      if (existingIndex !== -1) {
        return currentCart.map((cartItem, index) => {
          if (index !== existingIndex) {
            return cartItem;
          }

          return {
            ...cartItem,
            cantidad: (cartItem.cantidad || 1) + 1,
            gramosTotales: (cartItem.gramosTotales || cartItem.gramos) + item.gramos,
            precioTotal: cartItem.precioTotal + item.precioTotal
          };
        });
      }

      return [...currentCart, { ...item, cantidad: 1, gramosTotales: item.gramos }];
    });
  }, []);

  const removeFromCart = useCallback((index) => {
    setCart((currentCart) => currentCart.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index, delta) => {
    setCart((currentCart) => {
      const item = currentCart[index];
      if (!item) return currentCart;
      const newCantidad = (item.cantidad || 1) + delta;
      if (newCantidad <= 0) {
        return currentCart.filter((_, i) => i !== index);
      }
      const unitPrice = Math.round((item.precioUnitario || 0) * (item.gramos || 0) / 100);
      return currentCart.map((cartItem, i) => {
        if (i !== index) return cartItem;
        return {
          ...cartItem,
          cantidad: newCantidad,
          gramosTotales: cartItem.gramos * newCantidad,
          precioTotal: unitPrice * newCantidad
        };
      });
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const saveBuyer = useCallback((buyer) => {
    const normalizedBuyer = normalizeBuyer(buyer);
    setGuestBuyer(normalizedBuyer);
    return {
      ...normalizedBuyer,
      isAuthenticated: false
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) {
      throw new Error('Falta configurar las variables públicas de Supabase.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Ingresá un email válido.');
    }

    if (!password) {
      throw new Error('Ingresá tu contraseña.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) {
      throw new Error(error.message || 'No se pudo iniciar sesión.');
    }

    setGuestBuyer(null);
    setAuthSession(data.session || null);
    setAuthUser(data.user || null);

    return data;
  }, [supabase]);

  const signUp = useCallback(async ({ name, email, password }) => {
    if (!supabase) {
      throw new Error('Falta configurar las variables públicas de Supabase.');
    }

    const buyer = normalizeBuyer({
      name,
      email,
      phone: 'Pendiente',
      address: 'Pendiente',
      deliveryNotes: ''
    });

    if (!password || password.length < 6) {
      throw new Error('La contraseña tiene que tener al menos 6 caracteres.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: buyer.email,
      password,
      options: {
        data: {
          name: buyer.name
        }
      }
    });

    if (error) {
      throw new Error(error.message || 'No se pudo crear la cuenta.');
    }

    setGuestBuyer(null);
    setAuthSession(data.session || null);
    setAuthUser(data.user || null);

    return data;
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setAuthSession(null);
    setAuthUser(null);
  }, [supabase]);

  const getAccessToken = useCallback(() => authSession?.access_token || '', [authSession]);

  const getTotal = useCallback(() => total, [total]);

  return (
    <CartContext.Provider value={{
      cart,
      user,
      authUser,
      isAuthenticated: Boolean(authUser),
      isAuthReady,
      isLoaded,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      saveBuyer,
      signIn,
      signUp,
      signOut,
      getAccessToken,
      total,
      getTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
