'use client';

import { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function CartClearer({ status }) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (status === 'approved') {
      clearCart();
    }
  }, [status, clearCart]);

  return null;
}
