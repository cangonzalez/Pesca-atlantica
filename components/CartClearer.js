'use client';

import { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function CartClearer({ status }) {
  const { clearCart, isLoaded } = useCart();

  useEffect(() => {
    if (isLoaded && status === 'approved') {
      clearCart();
    }
  }, [isLoaded, status, clearCart]);

  return null;
}
