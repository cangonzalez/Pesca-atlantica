'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext();

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem('users')) || [];
  } catch {
    localStorage.removeItem('users');
    return [];
  }
}

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

  const registerUser = useCallback(({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const savedUsers = getStoredUsers();
    const userExists = savedUsers.some((savedUser) => savedUser.email === normalizedEmail);

    if (!normalizedName) {
      throw new Error('Ingresá tu nombre para registrarte.');
    }

    if (userExists) {
      throw new Error('Ya existe una cuenta con ese email.');
    }

    const newUser = {
      name: normalizedName,
      email: normalizedEmail,
      password
    };

    localStorage.setItem('users', JSON.stringify([...savedUsers, newUser]));
    const sessionUser = { name: newUser.name, email: newUser.email };
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const loginUser = useCallback(({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const savedUsers = getStoredUsers();
    const savedUser = savedUsers.find(
      (currentUser) => currentUser.email === normalizedEmail && currentUser.password === password
    );

    if (!savedUser) {
      throw new Error('Email o contraseña incorrectos.');
    }

    const sessionUser = { name: savedUser.name, email: savedUser.email };
    setUser(sessionUser);
    return sessionUser;
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
  }, []);

  const getTotal = useCallback(() => total, [total]);

  return (
    <CartContext.Provider value={{
      cart,
      user,
      addToCart,
      removeFromCart,
      clearCart,
      registerUser,
      loginUser,
      logoutUser,
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
