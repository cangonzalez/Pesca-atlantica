'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const savedUser = localStorage.getItem('user');

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('cart');
      localStorage.removeItem('user');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user, isLoaded]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.precioTotal, 0);
  }, [cart]);

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

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const saveBuyer = useCallback(({ name, email }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new Error('Ingresá tu nombre para continuar.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error('Ingresá un email válido.');
    }

    const sessionUser = {
      name: normalizedName,
      email: normalizedEmail
    };

    setUser(sessionUser);
    return sessionUser;
  }, []);

  const getTotal = useCallback(() => total, [total]);

  return (
    <CartContext.Provider value={{
      cart,
      user,
      addToCart,
      removeFromCart,
      clearCart,
      saveBuyer,
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
